import mongoose from 'mongoose';

const successStorySchema = new mongoose.Schema(
  {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adoptionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdoptionRequest',
      required: true,
      unique: true, // one story per adoption
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    story: {
      type: String,
      required: [true, 'Story content is required'],
      trim: true,
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

successStorySchema.index({ title: 'text', story: 'text', petName: 'text' });

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

export default SuccessStory;