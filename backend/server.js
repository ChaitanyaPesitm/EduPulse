/**
 * EduPulse AI – Express Server Entry Point
 * Works both locally (npm run dev) and on Vercel (serverless)
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost in dev + any Vercel preview/production URL in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,          // set this in Vercel env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) and listed origins
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', service: 'EduPulse Backend', time: new Date().toISOString() })
);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server (local only — Vercel handles this itself) ───────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ EduPulse Backend running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless
module.exports = app;
