const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. LOGGING MIDDLEWARE (First to catch everything)
app.use((req, res, next) => {
  console.log(`👉 [${req.method}] ${req.path}`);
  next();
});

// 2. CORS MIDDLEWARE (Standard Library)
// We explicitly allow "*" to avoid any origin matching issues.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. HANDLE PREFLIGHTS
app.options('*', cors()); // Enable preflight for all requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Root Route (to prevent 404s on base URL checks)
app.get('/', (req, res) => {
  res.send('API is running...');
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
