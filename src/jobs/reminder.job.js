import cron from 'node-cron';
import HealthRecord from '../models/healthRecord.model.js';
import Appointment from '../models/appointment.model.js';
import { createNotification } from '../utils/notify.utils.js';

/**
 * Finds health records due within the next 3 days that haven't had a
 * reminder sent yet for their CURRENT due date, notifies the owner,
 * then marks reminderSentAt so it won't fire again for this due date.
 */
const sendHealthReminders = async () => {
  const now = new Date();
  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);

  const dueRecords = await HealthRecord.find({
    isActive: true,
    nextDueDate: { $gte: now, $lte: in3Days },
    reminderSentAt: null, // only records that haven't been reminded yet for this due date
  }).populate('pet', 'name owner');

  let sentCount = 0;

  for (const record of dueRecords) {
    if (!record.pet) continue;

    await createNotification({
      user: record.pet.owner,
      type: 'health_reminder',
      title: `Upcoming: ${record.title}`,
      message: `${record.pet.name}'s "${record.title}" is due on ${record.nextDueDate.toDateString()}.`,
      link: `/pets/${record.pet._id}/health-records`,
    });

    record.reminderSentAt = new Date();
    await record.save();
    sentCount++;
  }

  console.log(`[Reminder Job] Sent ${sentCount} health reminder(s).`);
};

/**
 * Finds confirmed appointments happening tomorrow that haven't had a
 * reminder sent yet, notifies the owner, then marks reminderSent.
 */
const sendAppointmentReminders = async () => {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    status: 'confirmed',
    date: { $gte: tomorrowStart, $lte: tomorrowEnd },
    reminderSent: false,
  }).populate('pet', 'name');

  let sentCount = 0;

  for (const appt of appointments) {
    await createNotification({
      user: appt.owner,
      type: 'appointment',
      title: 'Appointment Tomorrow',
      message: `Reminder: ${appt.pet?.name || 'Your pet'}'s appointment is tomorrow at ${appt.startTime}.`,
      link: `/appointments/${appt._id}`,
    });

    appt.reminderSent = true;
    await appt.save();
    sentCount++;
  }

  console.log(`[Reminder Job] Sent ${sentCount} appointment reminder(s).`);
};

/**
 * Registers the daily cron job. Called once at server startup.
 */
export const startReminderJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Reminder Job] Running daily reminder check...');
    try {
      await sendHealthReminders();
      await sendAppointmentReminders();
    } catch (error) {
      console.error('[Reminder Job] Error:', error);
    }
  });

  console.log('Reminder job scheduled (daily at 08:00).');
};