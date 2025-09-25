import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  name: String,
  dueDate: Date,
  completed: { type: Boolean, default: false }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  milestones: [MilestoneSchema],
  goals: [String],
  template: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  health: { type: String, enum: ['On Track', 'At Risk', 'Off Track'], default: 'On Track' },
}, { timestamps: true });

ProjectSchema.index({ name: 1, companyId: 1 }, { unique: true });

export const Project = mongoose.model('Project', ProjectSchema);
