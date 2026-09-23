import mongoose from 'mongoose';

const vetAvailabilitySchema = new mongoose.Schema(
  {
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String, // "09:00" (24hr format, stored as string for simplicity)
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // "09:30"
      required: [true, 'End time is required'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

vetAvailabilitySchema.index({ vet: 1, date: 1 });

const VetAvailability = mongoose.model('VetAvailability', vetAvailabilitySchema);

export default VetAvailability;