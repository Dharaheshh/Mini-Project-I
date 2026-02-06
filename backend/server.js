const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Keeping import but bypassing library for manual control
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// MANUAL CORS MIDDLEWARE (The "Nuclear" Option)
// This strictly forces the headers on every response, bypassing any library quirks.
app.use((req, res, next) => {
  // Allow any origin
  res.header("Access-Control-Allow-Origin", "*");

  // Allow necessary methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Allow dynamic headers from the request, or standard ones
  const allowedHeaders = req.headers['access-control-request-headers'] || "Content-Type, Authorization, X-Requested-With";
  res.header("Access-Control-Allow-Headers", allowedHeaders);

  // Debug log to confirm request reached us
  console.log(`📡 [${req.method}] ${req.path} - Origin: ${req.headers.origin || 'Unknown'}`);

  // Intercept OPTIONS method for preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
console.log('⏳ Attempting MongoDB connection...');
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/damage-reporting', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
