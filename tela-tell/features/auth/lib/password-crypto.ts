import * as Crypto from 'expo-crypto';

const SALT_BYTE_LENGTH = 16;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(SALT_BYTE_LENGTH);
  return bytesToHex(randomBytes);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const combined = `${salt}:${password}`;

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
  );

  return hash;
}

export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === storedHash;
}
