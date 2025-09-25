import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['Owner', 'Manager', 'Member', 'Observer'], default: 'Member' },
}, { timestamps: true });

TeamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

export const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);
