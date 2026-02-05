const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const ML_API_URL = 'http://localhost:8000';

async function testConnection() {
    console.log(`🔍 Testing connection to ${ML_API_URL}...`);

    // 1. Test Health Endpoint
    try {
        console.log("1️⃣  Pinging /health...");
        const health = await axios.get(`${ML_API_URL}/health`, { timeout: 5000 });
        console.log("   ✅ Health Check: PASSED", health.data);
    } catch (error) {
        console.error("   ❌ Health Check: FAILED", error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error("      FATAL: Connection refused. Is the ML server running?");
            return;
        }
    }

    // 2. Test Prediction (if health passed)
    try {
        console.log("\n2️⃣  Testing /predict/category (Dummy Request)...");
        // Create a dummy file buffer
        const dummyBuffer = Buffer.from('fakeimagecontent');

        const formData = new FormData();
        formData.append('file', dummyBuffer, {
            filename: 'test.jpg',
            contentType: 'image/jpeg',
        });

        const start = Date.now();
        const response = await axios.post(
            `${ML_API_URL}/predict/category`,
            formData,
            { headers: formData.getHeaders(), timeout: 10000 }
        );
        const duration = (Date.now() - start) / 1000;

        console.log(`   ✅ Prediction: PASSED in ${duration.toFixed(2)}s`);
        console.log("      Response:", response.data);

    } catch (error) {
        console.error("   ❌ Prediction: FAILED", error.message);
        if (error.response) {
            console.error("      Server returned:", error.response.status, error.response.data);
        }
    }
}

testConnection();
