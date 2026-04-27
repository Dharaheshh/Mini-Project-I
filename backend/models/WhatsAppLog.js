const mongoose = require('mongoose');

/**
 * WhatsAppLog.js
 * Tracks every WhatsApp notification attempt — sent, failed, skipped, retrying.
 * Mirrors the pattern of the in-app Notification model but for external WhatsApp dispatches.
 */
const whatsAppLogSchema = new mongoose.Schema(
    {
        complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
            required: true,
        },
        recipient: {
            type: String,  // Phone number (e.g., "917418739758") or group ID
            required: true,
        },
        recipientType: {
            type: String,
            enum: ['admin', 'department_supervisor'],
            required: true,
        },
        department: {
            type: String,
            enum: ['infrastructure', 'electrical', 'plumbing'],
        },
        messageType: {
            type: String,
            enum: ['new_complaint', 'high_priority', 'sla_due_soon', 'sla_overdue', 'pdf_report'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'skipped_duplicate', 'retrying'],
            default: 'pending',
        },
        retries: {
            type: Number,
            default: 0,
        },
        apiResponse: {
            type: String, // WhatsApp message ID on success
        },
        errorMessage: {
            type: String, // Error message on failure
        },
        sentAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Index for querying logs by complaint
whatsAppLogSchema.index({ complaint: 1 });
whatsAppLogSchema.index({ status: 1 });
whatsAppLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WhatsAppLog', whatsAppLogSchema);
