import * as Crypto from 'expo-crypto';

/**
 * Local password hashing for offline SQLite auth.
 * Each user gets a unique salt; we store salt + hash in tblUser
 */

/** random bytes for the salt (16 bytes = 128 bits). */
const SALT_BYTE_LENGTH = 16;

/**
 * Turns random bytes into a hex string so we can save it as TEXT in SQLite.
 * Example: [10, 255] → "0aff"
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Creates a new random salt for one user.
 * Call this once during registration, then save it in tblUser.passwordSalt.
 */
export async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(SALT_BYTE_LENGTH);
  return bytesToHex(randomBytes);
}

/**
 * Hashes a password with a salt using SHA-256.
 * Same password + same salt → same hash (needed for login checks).
 * Same password + different salt → different hash.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  // Combine salt and password so the hash depends on both.
  const combined = `${salt}:${password}`;

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
  );

  return hash;
}

/**
 * Checks a login password against the stored salt + hash from the database.
 * Returns true only if the password is correct.
 */
export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === storedHash;
}