import mongoose from 'mongoose';
import validator from 'validator';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  email: { type: String, unique: true, required: true, lowercase: true, validate: validator.isEmail },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'ProjectManager', 'Contributor'], default: 'Contributor', index: true },
  jobRole: { type: String, enum: ['SE', 'QA', 'UI/UX', 'OPS'] },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  avatarUrl: String,
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true },
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  loginHistory: [{
    at: { type: Date, default: Date.now },
    ip: String,
    userAgent: String
  }],
}, { timestamps: true });

UserSchema.index({ role: 1, status: 1 });

export const User = mongoose.model('User', UserSchema);
