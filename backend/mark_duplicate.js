/**
 * Quick script to mark one complaint as duplicate to test the UI.
 * Run: node mark_duplicate.js
 * Delete this file after testing.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function markDuplicate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Complaint = mongoose.model('Complaint', new mongoose.Schema({}, { strict: false, collection: 'complaints' }));

        // Get the two most recent complaints
        const complaints = await Complaint.find({}).sort({ createdAt: -1 }).limit(2);

        if (complaints.length < 2) {
            console.log('❌ Need at least 2 complaints in the database to test.');
            process.exit(1);
        }

        const targetComplaint = complaints[0]; // Most recent
        const originalComplaint = complaints[1]; // Second most recent

        // Mark the most recent complaint as a duplicate of the second one
        await Complaint.updateOne(
            { _id: targetComplaint._id },
            { 
                $set: { 
                    duplicate: true, 
                    duplicateReference: originalComplaint._id 
                } 
            }
        );

        console.log(`\n🔗 Marked complaint as duplicate:`);
        console.log(`   Duplicate:  ${targetComplaint._id}`);
        console.log(`   Original:   ${originalComplaint._id}`);
        console.log(`\n✅ Done! Refresh your Admin Dashboard to see the "Duplicate Report" badge.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

markDuplicate();
