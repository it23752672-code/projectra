import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  category: { type: String, enum: ['Bug', 'Feature', 'Praise', 'Other'], default: 'Other' },
  status: { type: String, enum: ['New', 'Acknowledged', 'In Progress', 'Done'], default: 'New' },
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
