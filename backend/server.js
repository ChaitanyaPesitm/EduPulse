/**
 * EduPulse AI – Express Server Entry Point
 * Optimized for Vercel Serverless
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// ─── DB Connection Middleware ────────────────────────────────────────────────
// Ensures database is connected before processing any request
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      error: "Database Connection Failed",
      details: error.message
    });
  }
};

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Apply DB connection middleware to all API routes
app.use('/api', ensureDB);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/messages', require('./routes/messages'));

// Root / Health checks
app.get('/', (req, res) => res.send('EduPulse API is running...'));
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', service: 'EduPulse Backend', time: new Date().toISOString() })
);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server (local only) ───────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ EduPulse Backend running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel
module.exports = app;
