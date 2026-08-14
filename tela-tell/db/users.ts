import { getDatabase, isDatabaseAvailable } from '@/db/client';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from '@/features/auth/lib/password-crypto';

export type AuthUser = {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  middleInitial: string | null;
  avatarUri: string | null;
};

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  middleInitial?: string | null;
  username: string;
  password: string;
};

export type LoginUserInput = {
  username: string;
  password: string;
};

export type UpdateUserProfileInput = {
  firstName: string;
  lastName: string;
  middleInitial?: string | null;
  username: string;
  avatarUri?: string | null;
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
  username: string;
  passwordHash: string;
  passwordSalt: string;
  avatarUri: string | null;
};

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function rowToAuthUser(row: UserRow): AuthUser {
  return {
    userId: row.user_ID,
    username: row.username,
    firstName: row.firstName,
    lastName: row.lastName,
    middleInitial: row.middleInitial,
    avatarUri: row.avatarUri,
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
  const username = normalizeUsername(input.username);
  const password = input.password;

  if (!firstName || !lastName) {
    throw new AuthError('First name and last name are required.');
  }
  if (!username) {
    throw new AuthError('Username is required.');
  }
  if (!password) {
    throw new AuthError('Password is required.');
  }

  const db = await getDatabase();

  const existing = await db.getFirstAsync<{ user_ID: string }>(
    'SELECT user_ID FROM tblUser WHERE username = ? LIMIT 1',
    [username],
  );
  if (existing) {
    throw new AuthError('An account with this username already exists.');
  }

  const userId = createUserId();
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `INSERT INTO tblUser (
        user_ID, firstName, middleInitial, lastName, username,
        passwordHash, passwordSalt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        middleInitial,
        lastName,
        username,
        passwordHash,
        salt,
        now,
        now,
      ],
    );
  } catch {
    throw new AuthError('An account with this username already exists.');
  }

  return {
    userId,
    username,
    firstName,
    lastName,
    middleInitial,
    avatarUri: null,
  };
}

export async function loginUser(input: LoginUserInput): Promise<AuthUser> {
  if (!isDatabaseAvailable()) {
    throw new AuthError('Local database is not available on this platform.');
  }

  const username = normalizeUsername(input.username);
  const password = input.password;

  if (!username || !password) {
    throw new AuthError('Invalid username or password.');
  }

  const db = await getDatabase();

  const row = await db.getFirstAsync<UserRow>(
    `SELECT user_ID, firstName, middleInitial, lastName, username, passwordHash, passwordSalt, avatarUri
     FROM tblUser
     WHERE username = ?
     LIMIT 1`,
    [username],
  );

  if (!row) {
    throw new AuthError('Invalid username or password.');
  }

  const ok = await verifyPassword(password, row.passwordSalt, row.passwordHash);
  if (!ok) {
    throw new AuthError('Invalid username or password.');
  }

  return rowToAuthUser(row);
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput,
): Promise<AuthUser> {
  if (!isDatabaseAvailable()) {
    throw new AuthError('Local database is not available on this platform.');
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const middleInitial = input.middleInitial?.trim() || null;
  const username = normalizeUsername(input.username);

  if (!firstName || !lastName) {
    throw new AuthError('First name and last name are required.');
  }
  if (!username) {
    throw new AuthError('Username is required.');
  }

  const db = await getDatabase();

  const existing = await db.getFirstAsync<{ user_ID: string }>(
    'SELECT user_ID FROM tblUser WHERE username = ? AND user_ID != ? LIMIT 1',
    [username, userId],
  );
  if (existing) {
    throw new AuthError('An account with this username already exists.');
  }

  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `UPDATE tblUser
       SET firstName = ?, middleInitial = ?, lastName = ?, username = ?, avatarUri = ?, updatedAt = ?
       WHERE user_ID = ?`,
      [
        firstName,
        middleInitial,
        lastName,
        username,
        input.avatarUri ?? null,
        now,
        userId,
      ],
    );
  } catch {
    throw new AuthError('An account with this username already exists.');
  }

  const updated = await getUserById(userId);
  if (!updated) {
    throw new AuthError('Could not update your profile. Please try again.');
  }
  return updated;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new AuthError('Local database is not available on this platform.');
  }

  if (!newPassword) {
    throw new AuthError('New password is required.');
  }

  const db = await getDatabase();

  const row = await db.getFirstAsync<UserRow>(
    `SELECT user_ID, firstName, middleInitial, lastName, username, passwordHash, passwordSalt, avatarUri
     FROM tblUser
     WHERE user_ID = ?
     LIMIT 1`,
    [userId],
  );

  if (!row) {
    throw new AuthError('Account not found.');
  }

  const ok = await verifyPassword(currentPassword, row.passwordSalt, row.passwordHash);
  if (!ok) {
    throw new AuthError('Current password is incorrect.');
  }

  const salt = await generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  const now = new Date().toISOString();

  await db.runAsync(
    'UPDATE tblUser SET passwordHash = ?, passwordSalt = ?, updatedAt = ? WHERE user_ID = ?',
    [passwordHash, salt, now, userId],
  );
}

export async function deleteUser(userId: string): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new AuthError('Local database is not available on this platform.');
  }

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const scans = await db.getAllAsync<{ scan_ID: string }>(
      'SELECT scan_ID FROM tblScan WHERE user_id = ?',
      [userId],
    );
    for (const scan of scans) {
      await db.runAsync('DELETE FROM tblScanComposition WHERE scan_ID = ?', [scan.scan_ID]);
    }
    await db.runAsync('DELETE FROM tblScan WHERE user_id = ?', [userId]);

    const profiles = await db.getAllAsync<{ profile_ID: number }>(
      'SELECT profile_ID FROM tblDeviceProfile WHERE user_id = ?',
      [userId],
    );
    for (const profile of profiles) {
      await db.runAsync('DELETE FROM tblSensitiveFiber WHERE profile_ID = ?', [profile.profile_ID]);
      await db.runAsync('DELETE FROM tblPreferredFiber WHERE profile_ID = ?', [profile.profile_ID]);
      await db.runAsync('DELETE FROM tblDressingContext WHERE profile_ID = ?', [profile.profile_ID]);
    }
    await db.runAsync('DELETE FROM tblDeviceProfile WHERE user_id = ?', [userId]);

    await db.runAsync('DELETE FROM tblUser WHERE user_ID = ?', [userId]);
  });
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  if (!isDatabaseAvailable()) {
    return null;
  }

  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>(
    `SELECT user_ID, firstName, middleInitial, lastName, username, passwordHash, passwordSalt, avatarUri
     FROM tblUser
     WHERE user_ID = ?
     LIMIT 1`,
    [userId],
  );

  return row ? rowToAuthUser(row) : null;
}
