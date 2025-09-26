import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const TaskSchema = new mongoose.Schema({
  // Basic naming (legacy + enhanced)
  title: { type: String },
  description: String,
  taskName: String,
  taskDescription: String,

  // Task hierarchy
  taskType: { type: String, enum: ['Main Task', 'Sub Task', 'Sub-Sub Task'], default: 'Main Task' },
  parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  subTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  taskLevel: { type: Number, default: 1 },

  // Assignment details
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // legacy multi-assign

  // Details
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled', 'Blocked'], default: 'Not Started', index: true },
  tags: [String],
  view: { type: String, enum: ['List', 'Kanban', 'Calendar'], default: 'List' },
  attachments: [{ name: String, url: String }],

  // Time management
  dueDate: Date,
  estimatedHours: Number,
  actualHours: { type: Number, default: 0 },
  startDate: Date,
  completedDate: Date,

  // Weightage and difficulty
  taskWeightage: { type: Number, min: 1, max: 10, default: 5 },
  difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },

  // Requirements
  requiredSkills: [String],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // legacy name
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],

  // Tracking
  progress: { type: Number, min: 0, max: 100, default: 0 }, // legacy
  progressPercentage: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  comments: [CommentSchema],
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    comments: String
  }]
}, { timestamps: true });

TaskSchema.index({ projectId: 1, status: 1 });
// Text index for full-text search on title and description only
TaskSchema.index({ title: 'text', description: 'text' });
// Separate index on tags to support filtering without conflicting with text index
TaskSchema.index({ tags: 1 });

export const Task = mongoose.model('Task', TaskSchema);
