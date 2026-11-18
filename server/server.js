import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import studentOrderRoutes from './routes/studentOrderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Security & Core Middleware ────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/student-orders', studentOrderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrintQueue API is running' });
});

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🖨️  PrintQueue server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
