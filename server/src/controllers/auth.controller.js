import { User } from '../models/User.js';
import { hashPassword, comparePassword, signToken, signRefreshToken, verifyRefreshToken } from '../utils/auth.js';
import validator from 'validator';

export async function register(req, res) {
  const { firstName, lastName, email, password, role } = req.body;
  if (!firstName || !lastName || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const passwordHash = await hashPassword(password);
  const user = await User.create({ firstName, lastName, email, passwordHash, role: role || 'Contributor' });
  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);
  res.status(201).json({ user: sanitize(user), accessToken, refreshToken });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });
  user.loginHistory.push({ at: new Date(), ip: req.ip, userAgent: req.headers['user-agent'] });
  await user.save();
  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);
  res.json({ user: sanitize(user), accessToken, refreshToken });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).lean();
  res.json({ user: sanitize(user) });
}

export async function refresh(req, res) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Missing token' });
  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const accessToken = signToken(user);
    res.json({ accessToken });
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export async function logout(req, res) {
  // With stateless JWT, client simply discards tokens; optionally handle server-side blacklist (not implemented)
  res.json({ message: 'Logged out' });
}

function sanitize(user) {
  const { passwordHash, __v, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
}
