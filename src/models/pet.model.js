import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'], // e.g. Dog, Cat, Bird
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    dateOfBirth: {
      type: Date,
    },
    weight: {
      type: Number, // in kg
    },
    color: {
      type: String,
      trim: true,
    },
    photo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // soft-delete flag
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast lookups of "all pets belonging to owner X"
petSchema.index({ owner: 1 });

petSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const ageDifMs = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

const Pet = mongoose.model('Pet', petSchema);

export default Pet;