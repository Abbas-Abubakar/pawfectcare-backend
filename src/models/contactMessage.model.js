import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['contact', 'volunteer'],
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true, // mainly for 'contact' type
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    availability: {
      type: String,
      trim: true, // mainly for 'volunteer' type, e.g. "Weekends, 2-3 hrs"
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ type: 1, status: 1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;