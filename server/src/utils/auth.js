import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(user) {
  const payload = { sub: user._id.toString(), type: 'refresh' };
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || 'dev_secret') + '_refresh';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || 'dev_secret') + '_refresh';
  return jwt.verify(token, secret);
}
