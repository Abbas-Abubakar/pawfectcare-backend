import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // could be the owner or a vet
    },
    type: {
      type: String,
      enum: ['vaccination', 'deworming', 'allergy', 'checkup', 'other'],
      required: [true, 'Record type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'], // e.g. "Rabies Vaccine", "Peanut Allergy"
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dateAdministered: {
      type: Date, // when the vaccine/treatment was given (not relevant for 'allergy' type)
    },
    nextDueDate: {
      type: Date, // drives reminders, e.g. next vaccine booster due
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      // only meaningful when type === 'allergy'; left undefined otherwise
    },
    isActive: {
      type: Boolean,
      default: true, // soft-delete flag, same pattern as Pet
    },
  },
  {
    timestamps: true,
  }
);

healthRecordSchema.index({ pet: 1, type: 1 });
healthRecordSchema.index({ nextDueDate: 1 }); // will help the future reminder scheduler query efficiently

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

export default HealthRecord;