import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', unique: true },
  branding: {
    logoUrl: String,
    colorScheme: { primary: String, secondary: String }
  },
  integrations: {
    slack: { enabled: { type: Boolean, default: false }, webhookUrl: String },
    googleWorkspace: { enabled: { type: Boolean, default: false } },
    microsoftTeams: { enabled: { type: Boolean, default: false } },
  },
  analytics: {
    enabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

export const Settings = mongoose.model('Settings', SettingsSchema);
