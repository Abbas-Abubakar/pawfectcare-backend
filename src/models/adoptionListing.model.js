import mongoose from 'mongoose';

const adoptionListingSchema = new mongoose.Schema(
  {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // the shelter_admin who posted this
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
    },
    age: {
      type: String, // e.g. "2 years", "6 months" — kept as free text since exact DOB is often unknown for shelter animals
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    description: {
      type: String,
      trim: true,
    },
    temperament: {
      type: String,
      trim: true, // e.g. "Friendly, good with kids, house-trained"
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['available', 'pending', 'adopted'],
      default: 'available',
    },
    isActive: {
      type: Boolean,
      default: true, // soft-delete flag, separate from 'status' (adoption lifecycle)
    },
  },
  {
    timestamps: true,
  }
);

adoptionListingSchema.index({ species: 1, status: 1 });


const AdoptionListing = mongoose.model('AdoptionListing', adoptionListingSchema);

export default AdoptionListing;