import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  tags: [String],
  parentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
}, { timestamps: true });

TeamSchema.index({ name: 1, companyId: 1 }, { unique: true });

export const Team = mongoose.model('Team', TeamSchema);
