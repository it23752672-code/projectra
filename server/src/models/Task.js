import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const TaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  title: { type: String, required: true },
  description: String,
  attachments: [{ name: String, url: String }],
  dueDate: Date,
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  tags: [String],
  view: { type: String, enum: ['List', 'Kanban', 'Calendar'], default: 'List' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'Blocked'], default: 'Not Started', index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  comments: [CommentSchema],
}, { timestamps: true });

TaskSchema.index({ projectId: 1, status: 1 });
// Text index for full-text search on title and description only
TaskSchema.index({ title: 'text', description: 'text' });
// Separate index on tags to support filtering without conflicting with text index
TaskSchema.index({ tags: 1 });

export const Task = mongoose.model('Task', TaskSchema);
