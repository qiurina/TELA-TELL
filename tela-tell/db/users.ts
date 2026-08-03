import { getDatabase, isDatabaseAvailable } from '@/db/client';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from '@/features/auth/lib/password-crypto';

export type AuthUser = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial: string | null;
};

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  middleInitial?: string | null;
  email: string;
  password: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

type UserRow = {
  user_ID: string;
  firstName: string;
  middleInitial: string | null;
  lastName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function rowToAuthUser(row: UserRow): AuthUser {
  return {
    userId: row.user_ID,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    middleInitial: row.middleInitial,
  };
}

function createUserId(): string {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}


export async function registerUser(input: RegisterUserInput): Promise<AuthUser> {
  if (!isDatabaseAvailable()) {
    throw new AuthError('Local database is not available on this platform.');
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const middleInitial = input.middleInitial?.trim() || null;
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!firstName || !lastName) {
    throw new AuthError('First name and last name are required.');
  }
  if (!email) {
    throw new AuthError('Email is required.');
  }
  if (!password) {
    throw new AuthError('Password is required.');
  }

  const db = await getDatabase();

  const existing = await db.getFirstAsync<{ user_ID: string }>(
    'SELECT user_ID FROM tblUser WHERE email = ? LIMIT 1',
    [email],
  );
  if (existing) {
    throw new AuthError('An account with this email already exists.');
  }

  const userId = createUserId();
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `INSERT INTO tblUser (
        user_ID, firstName, middleInitial, lastName, email,
        passwordHash, passwordSalt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        middleInitial,
        lastName,
        email,
        passwordHash,
        salt,
        now,
        now,
      ],
    );
  } catch {
    throw new AuthError('An account with this email already exists.');
  }

  return {
    userId,
    email,
    firstName,
    lastName,
    middleInitial,
  };
}

export async function loginUser(input: LoginUserInput): Promise<AuthUser> {
  if (!isDatabaseAvailable()) {
    throw new AuthError('Local database is not available on this platform.');
  }

  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    throw new AuthError('Invalid email or password.');
  }

  const db = await getDatabase();

  const row = await db.getFirstAsync<UserRow>(
    `SELECT user_ID, firstName, middleInitial, lastName, email, passwordHash, passwordSalt
     FROM tblUser
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  if (!row) {
    throw new AuthError('Invalid email or password.');
  }

  const ok = await verifyPassword(password, row.passwordSalt, row.passwordHash);
  if (!ok) {
    throw new AuthError('Invalid email or password.');
  }

  return rowToAuthUser(row);
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  if (!isDatabaseAvailable()) {
    return null;
  }

  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>(
    `SELECT user_ID, firstName, middleInitial, lastName, email, passwordHash, passwordSalt
     FROM tblUser
     WHERE user_ID = ?
     LIMIT 1`,
    [userId],
  );

  return row ? rowToAuthUser(row) : null;
}