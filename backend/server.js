const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. LOGGING (First)
app.use((req, res, next) => {
  console.log(`👉 [${req.method}] ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// 2. DEBUG ROUTES (IMMEDIATELY AFTER LOGGING - NO MIDDLEWARE)
// This proves if the server is even capable of responding.
app.get('/api/test-debug', (req, res) => {
  console.log('✅ /api/test-debug hit! sending response...');
  res.header("Access-Control-Allow-Origin", "*"); // Manual header for this route only
  res.json({ status: 'alive', message: 'If you see this, the server is working.' });
});

app.get('/', (req, res) => {
  res.send('API Root is reachable.');
});

// 3. CORS (Standard)
app.use(cors());

app.options('*', cors());


// 4. BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. APP ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
console.log('⏳ Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/damage-reporting', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
