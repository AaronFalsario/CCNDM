import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
}

export function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]?\$\d{2}\$/.test(value);
}