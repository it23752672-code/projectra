#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/lib/db.js';
import { User } from '../src/models/User.js';
import { hashPassword, signToken, signRefreshToken } from '../src/utils/auth.js';

async function main() {
  const args = process.argv.slice(2);
  const [emailArg, passwordArg, firstNameArg, lastNameArg] = args;

  const email = emailArg || process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = passwordArg || process.env.ADMIN_PASSWORD || 'Admin1234!';
  const firstName = firstNameArg || process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = lastNameArg || process.env.ADMIN_LAST_NAME || 'User';
  const reset = (process.env.ADMIN_RESET || '0') === '1';

  if (!email || !password) {
    console.error('Usage: npm run seed:admin -- <email> <password> [firstName] [lastName]');
    console.error('Or set env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME');
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email });

  if (!user) {
    const passwordHash = await hashPassword(password);
    user = await User.create({ firstName, lastName, email, passwordHash, role: 'Admin', status: 'active' });
    console.log('✅ Created Admin user.');
  } else {
    const updates = {};
    if (user.role !== 'Admin') updates.role = 'Admin';
    if (reset) updates.passwordHash = await hashPassword(password);
    if (firstName && user.firstName !== firstName) updates.firstName = firstName;
    if (lastName && user.lastName !== lastName) updates.lastName = lastName;

    if (Object.keys(updates).length) {
      user.set(updates);
      await user.save();
      console.log('✅ Updated existing user to Admin (and/or reset fields).');
    } else {
      console.log('ℹ️ User already exists and is Admin. No changes made.');
    }
  }

  // Re-fetch latest
  user = await User.findById(user._id);

  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);

  console.log('--- Admin User ---');
  console.log(JSON.stringify({
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status
  }, null, 2));

  console.log('--- Tokens (use in Postman) ---');
  console.log(JSON.stringify({ accessToken, refreshToken }, null, 2));

  console.log('\nNext steps:');
  console.log('- In Postman, set Authorization type to Bearer Token and paste the accessToken.');
  console.log('- Base URL: http://localhost:' + (process.env.PORT || 4000));
  console.log('- Try GET /api/admin/plans');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed admin failed:', err?.message || err);
  process.exit(1);
});
