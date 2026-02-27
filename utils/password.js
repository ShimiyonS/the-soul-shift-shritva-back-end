/**
 * Password hashing (bcrypt) - same as invest2gold_backend.
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
