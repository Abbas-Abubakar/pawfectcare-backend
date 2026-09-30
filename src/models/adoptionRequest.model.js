import mongoose from 'mongoose';

const adoptionRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdoptionListing',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      trim: true, // why they'd be a good fit, living situation, etc.
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
      trim: true, // shelter's reason for approval/rejection
    },
    resultingPet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet', // set once approved and a Pet record is created for the adopter
    },
  },
  {
    timestamps: true,
  }
);

adoptionRequestSchema.index({ listing: 1, status: 1 });
adoptionRequestSchema.index({ applicant: 1 });

const AdoptionRequest = mongoose.model('AdoptionRequest', adoptionRequestSchema);

export default AdoptionRequest;