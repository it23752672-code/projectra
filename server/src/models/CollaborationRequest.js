import mongoose from 'mongoose';

const CollaborationRequestSchema = new mongoose.Schema({
  requestingCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  targetCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  requestedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skillsRequired: [{ type: String }],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  message: String,
  proposedDuration: String,
  proposedBudget: Number,
  deadline: Date,
  attachments: [{ name: String, url: String }],
  responseMessage: String,
  actualStartDate: Date,
  actualEndDate: Date,
  rating: { type: Number, min: 0, max: 5 },
  feedback: String,
}, { timestamps: true });

CollaborationRequestSchema.index({ requestingCompanyId: 1, targetCompanyId: 1, status: 1, createdAt: -1 });

export const CollaborationRequest = mongoose.model('CollaborationRequest', CollaborationRequestSchema);
