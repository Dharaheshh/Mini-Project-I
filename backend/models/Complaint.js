const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Chair', 'Bench', 'Projector', 'Socket', 'Pipe', 'Other'],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'In-Progress', 'Resolved'],
      default: 'Submitted',
    },
    severity: {
      type: String,
      enum: ['Minor', 'Moderate', 'Severe', 'Hazardous'],
      default: 'Moderate',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);

