import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import escrowRoutes from './routes/escrow';
import nidRoutes from './routes/nid';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health Check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', name: 'Bechedin Marketplace API', version: '1.0.0' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/nid', nidRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`🚀 Bechedin API running on http://localhost:${port}`);
  console.log(`📚 Routes: /api/auth, /api/listings, /api/escrow, /api/nid`);
});

export default app;
