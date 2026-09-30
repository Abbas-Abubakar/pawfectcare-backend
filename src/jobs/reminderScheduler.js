import cron from 'node-cron';
import HealthRecord from '../models/healthRecord.model.js';
import Appointment from '../models/appointment.model.js';
import Pet from '../models/pet.model.js';
import { createNotification } from '../utils/notify.utils.js';
import { sendEmail } from '../utils/mailer.utils.js';
import User from '../models/user.model.js';

/**
 * Health reminders: find health records with nextDueDate within the next 3 days
 * that haven't already triggered a reminder today, and notify the pet's owner.
 */
const runHealthReminders = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const dueRecords = await HealthRecord.find({
    isActive: true,
    nextDueDate: { $gte: now, $lte: threeDaysFromNow },
  }).populate({ path: 'pet', populate: { path: 'owner' } });

  for (const record of dueRecords) {
    if (!record.pet || !record.pet.owner) continue;

    const owner = record.pet.owner;
    const dueDateStr = record.nextDueDate.toDateString();

    await createNotification({
      userId: owner._id,
      type: 'health_reminder',
      title: `Upcoming: ${record.title}`,
      message: `${record.pet.name}'s ${record.title.toLowerCase()} is due on ${dueDateStr}.`,
      link: `/pets/${record.pet._id}/health-records`,
    });

    await sendEmail({
      to: owner.email,
      subject: `Reminder: ${record.pet.name}'s ${record.title} is due soon`,
      html: `<p>Hi ${owner.name},</p><p><strong>${record.pet.name}</strong>'s <strong>${record.title}</strong> is due on <strong>${dueDateStr}</strong>. Please schedule accordingly.</p>`,
    });
  }

  console.log(`[Reminder Job] Health reminders sent: ${dueRecords.length}`);
};

/**
 * Appointment reminders: find confirmed appointments happening tomorrow, remind the owner.
 */
const runAppointmentReminders = async () => {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    status: 'confirmed',
    date: { $gte: tomorrowStart, $lte: tomorrowEnd },
  })
    .populate('owner')
    .populate('pet', 'name')
    .populate('vet', 'name');

  for (const appt of appointments) {
    await createNotification({
      userId: appt.owner._id,
      type: 'appointment_reminder',
      title: 'Appointment Tomorrow',
      message: `${appt.pet.name}'s appointment with Dr. ${appt.vet.name} is tomorrow at ${appt.startTime}.`,
      link: `/appointments/${appt._id}`,
    });

    await sendEmail({
      to: appt.owner.email,
      subject: `Reminder: ${appt.pet.name}'s appointment is tomorrow`,
      html: `<p>Hi ${appt.owner.name},</p><p>This is a reminder that <strong>${appt.pet.name}</strong>'s appointment with <strong>Dr. ${appt.vet.name}</strong> is tomorrow at <strong>${appt.startTime}</strong>.</p>`,
    });
  }

  console.log(`[Reminder Job] Appointment reminders sent: ${appointments.length}`);
};

/**
 * Starts all scheduled jobs. Called once from server.js on boot.
 */
export const startReminderJobs = () => {
  // Runs once daily at 8:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('[Reminder Job] Running daily reminders...');
    try {
      await runHealthReminders();
      await runAppointmentReminders();
    } catch (error) {
      console.error('[Reminder Job] Failed:', error);
    }
  });

  console.log('Reminder scheduler started (daily at 08:00).');
};