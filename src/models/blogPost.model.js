import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300, // short summary shown in list views
    },
    category: {
      type: String,
      enum: ['nutrition', 'health', 'training', 'grooming', 'adoption', 'general'],
      required: [true, 'Category is required'],
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


blogPostSchema.index({ category: 1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;