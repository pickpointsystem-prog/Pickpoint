import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.js';
import { query } from './db.js';
import { initializeSocket } from './socket/handler.js';

import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import locationRoutes from './routes/locations.js';

const app = express();
const httpServer = createServer(app);

/**
 * Middleware
 */
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/locations', locationRoutes);

/**
 * Initialize Socket.io
 */
initializeSocket(httpServer);

/**
 * Error handling
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * 404
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Start server
 */
const PORT = config.PORT;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║       🚀 Pickpoint Backend Server Running 🚀          ║
╠════════════════════════════════════════════════════════╣
║ Environment: ${config.NODE_ENV.padEnd(38)}║
║ Port: ${config.PORT.toString().padEnd(46)}║
║ Database: ${config.DB_HOST}:${config.DB_PORT.toString().padEnd(35)}║
║ CORS Origin: ${config.CORS_ORIGIN.join(', ').padEnd(35)}║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
