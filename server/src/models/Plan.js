import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  priceMonthly: { type: Number, required: true },
  features: [String],
  payHerePlanId: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Plan = mongoose.model('Plan', PlanSchema);
