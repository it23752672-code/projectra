import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String, unique: true, sparse: true },
  availabilityStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  contacts: [{ name: String, email: String }],
  // Extended optional fields for Companies Network UI
  specializations: [String],
  trustScore: { type: Number, min: 0, max: 5, default: 4 },
  logoUrl: String,
  industryType: String,
  size: String,
  activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  collaborationStatus: { type: String, enum: ['Active', 'Pending', 'Inactive'], default: 'Active' },
  pmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Vendor = mongoose.model('Vendor', VendorSchema);
