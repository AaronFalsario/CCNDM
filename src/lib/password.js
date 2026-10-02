import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(password) {
  return hash(password, SALT_ROUNDS);
}

export function verifyPassword(password, hashedPassword) {
  return compare(password, hashedPassword);
}

export function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}