const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: 'global',
        },
        adminEmail: {
            type: String,
            default: '',
        },
        autoEscalationEnabled: {
            type: Boolean,
            default: false,
        },
        escalationThreshold: {
            type: Number,
            default: 48, // hours
        },
        notificationPreferences: {
            newComplaint: { type: Boolean, default: true },
            statusUpdates: { type: Boolean, default: true },
            highPriority: { type: Boolean, default: true },
        },
        reportDefaults: {
            defaultRange: { type: String, enum: ['week', 'month', 'year'], default: 'month' },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Settings', settingsSchema);
