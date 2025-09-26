import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './lib/db.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import teamRoutes from './routes/teams.routes.js';
import projectRoutes from './routes/projects.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import adminRoutes from './routes/admin.routes.js';
import miscRoutes from './routes/misc.routes.js';
import networkRoutes from './routes/network.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import aiRoutes from './routes/ai.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import projectManagerRoutes from './routes/projectManager.routes.js';
import teamLeaderRoutes from './routes/teamLeader.routes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
  }
});

app.set('io', io);

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Basic rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/auth', authLimiter);

// Database
await connectDB();

// Sync Task indexes to avoid incompatible text index from older versions
try {
  const { Task } = await import('./models/Task.js');
  await Task.syncIndexes();
} catch (e) {
  // non-fatal warning
  console.warn('Index sync warning (Task):', e?.message || e);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', networkRoutes);
app.use('/api', miscRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback-mgmt', feedbackRoutes);
app.use('/api/pm', projectManagerRoutes);
app.use('/api/leader', teamLeaderRoutes);

// Serve client (static) ONLY if build exists to avoid ENOENT
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Prefer Vite build output at ./client/dist
const clientDistDir = path.join(__dirname, '..', '..', 'client', 'dist');
const clientDistIndex = path.join(clientDistDir, 'index.html');

if (fs.existsSync(clientDistIndex)) {
  app.use(express.static(clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(clientDistIndex);
  });
} else {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    // In development without client build, forward non-API routes to Vite dev server
    const viteUrl = process.env.VITE_DEV_SERVER || 'http://localhost:5173';
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      const target = viteUrl + req.originalUrl;
      res.redirect(target);
    });
  } else {
    // Fallback: friendly message when the client build is not present
    app.get('/', (req, res) => {
      res.json({
        ok: true,
        message: 'ProJectra API is running. No client build found.',
        tip: 'Call /api/health for status. Build the client (npm run client:build) to enable static serving.'
      });
    });
  }
}

// Errors
app.use(notFound);
app.use(errorHandler);

// Sockets
io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

const BASE_PORT = parseInt(process.env.PORT || '4000', 10);
const MAX_RETRIES = parseInt(process.env.PORT_RETRIES || '3', 10);

function startServer(port, retriesLeft) {
  const onListening = () => {
    console.log(`ProJectra API running on port ${port}`);
  };

  const onError = (err) => {
    if (err && err.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
      setTimeout(() => startServer(nextPort, retriesLeft - 1), 500);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  };

  server.removeAllListeners('listening');
  server.removeAllListeners('error');
  server.on('listening', onListening);
  server.on('error', onError);
  server.listen(port);
}

startServer(BASE_PORT, MAX_RETRIES);
