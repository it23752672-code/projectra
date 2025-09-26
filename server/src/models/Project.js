import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  name: String,
  dueDate: Date,
  completed: { type: Boolean, default: false }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  // Basic
  name: { type: String, required: true },
  description: String,

  // Timeline
  startDate: Date,
  endDate: Date,
  milestones: [MilestoneSchema],

  // Goals / Templates
  goals: [String],
  template: { type: String },

  // Company / Collaboration
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],

  // Legacy management arrays
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Health (existing)
  health: { type: String, enum: ['On Track', 'At Risk', 'Off Track'], default: 'On Track' },

  // Enhanced PM fields
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'], default: 'Planning' },

  // Weightage and resources
  projectWeightage: { type: Number, min: 1, max: 10, default: 5 },
  estimatedHours: Number,
  budgetAllocated: Number,

  // Team management structure
  teamMembers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Team Leader', 'Senior Developer', 'Developer', 'Designer', 'Tester', 'Contributor'], required: true },
    assignedDate: { type: Date, default: Date.now },
    hourlyRate: Number,
    maxHoursPerWeek: { type: Number, default: 40 }
  }],
  teamLeaders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Metrics
  completionPercentage: { type: Number, default: 0 },
  totalTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  overdueTasks: { type: Number, default: 0 }
}, { timestamps: true });

ProjectSchema.index({ name: 1, companyId: 1 }, { unique: true });

export const Project = mongoose.model('Project', ProjectSchema);
