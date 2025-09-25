import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try to load environment variables with a few useful fallbacks
function loadEnvWithFallbacks() {
  dotenv.config(); // default .env (current working directory)
  if (process.env.MONGODB_URI) return 'default';

  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'server', '.env'), // common misplacement when running from ./server
    path.join(cwd, '..', '.env'),     // parent directory
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      if (process.env.MONGODB_URI) return p;
    }
  }
  return null;
}

const loadedEnvFrom = loadEnvWithFallbacks();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not defined. Starting server without a database connection. Checked:', loadedEnvFrom || 'none');
    return; // Allow the API to start in a degraded mode (useful for frontend dev)
  }

  try {
    mongoose.set('strictQuery', true);

    // Helpful connection state logs
    mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
    mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));
    mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));

    await mongoose.connect(uri, {
      // With Mongoose 8+, most options are defaults. Allow dbName override if provided.
      dbName: process.env.MONGODB_DB_NAME || undefined,
    });

    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️ Continuing to run without an active database connection for development purposes.');
    // Do not exit; keep the server running to avoid proxy ECONNREFUSED during frontend dev
  }
}
