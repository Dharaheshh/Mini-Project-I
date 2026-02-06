const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// STANDARD DEFAULT CORS - Allows All Origins, Logged for Debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path} from ${req.headers.origin}`);
  next();
});

app.use(cors()); // Defaults to origin: *
app.options('*', cors()); // Handle preflights

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
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Do not exit process, let server run to return 500s or at least CORS headers
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
