import mongoose from 'mongoose';

const BrowserInfoSchema = new mongoose.Schema({
  userAgent: String,
  screenResolution: String,
  platform: String,
}, { _id: false });

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  fileUrl: String,
  uploadedAt: Date,
}, { _id: false });

const InternalNoteSchema = new mongoose.Schema({
  note: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true, maxlength: 100, trim: true },
  feedbackText: { type: String, required: true, maxlength: 2000, trim: true },
  feedbackType: { type: String, enum: ['bug', 'feature_request', 'improvement', 'general', 'ui_issue', 'performance'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },

  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'closed', 'rejected'], default: 'pending', index: true },

  reply: { type: String, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },

  browserInfo: { type: BrowserInfoSchema, default: {} },
  attachments: { type: [AttachmentSchema], default: [] },

  internalNotes: { type: [InternalNoteSchema], default: [] },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

FeedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
