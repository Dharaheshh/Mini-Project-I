const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. AGGRESSIVE LOGGING (Log everything immediately)
app.use((req, res, next) => {
  console.log(`👉 [${req.method}] ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// 2. CORS (Universal Allow)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Preflight handler
app.options('*', cors());

// 3. DEBUG ENDPOINT (Ping this to verify API is reachable)
app.get('/api/test-cors', (req, res) => {
  console.log('✅ /api/test-cors hit!');
  res.json({
    status: 'success',
    message: 'Backend is reachable and CORS is active',
    yourOrigin: req.headers.origin
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Root
app.get('/', (req, res) => {
  res.send('API is running... Use /api/test-cors to verify connectivity.');
});

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
