import mongoose from 'mongoose';

const AIInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  context: { type: Object, default: {} },
  responseTime: { type: Number, default: 0 }, // ms
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

AIInteractionSchema.index({ userId: 1, createdAt: -1 });

export const AIInteraction = mongoose.model('AIInteraction', AIInteractionSchema);
