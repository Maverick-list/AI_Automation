// ============================================
// MaveFlow - Encryption Utilities
// ============================================
// AES-256-GCM encryption for securing sensitive
// data like OAuth refresh tokens before DB storage.

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128-bit IV
const TAG_LENGTH = 16; // 128-bit auth tag
const ENCODING: BufferEncoding = "hex";

/**
 * Gets the encryption key from environment variables.
 * Returns a 32-byte buffer derived from the hex-encoded ENCRYPTION_KEY.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  // The key should be 64 hex characters = 32 bytes
  return Buffer.from(key, "hex");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a colon-separated string: iv:authTag:ciphertext
 *
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in format "iv:authTag:ciphertext"
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all hex-encoded)
  return [
    iv.toString(ENCODING),
    authTag.toString(ENCODING),
    encrypted,
  ].join(":");
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 *
 * @param encryptedData - The encrypted string in format "iv:authTag:ciphertext"
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();

  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format. Expected iv:authTag:ciphertext");
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
  }
  if (authTag.length !== TAG_LENGTH) {
    throw new Error(`Invalid auth tag length: expected ${TAG_LENGTH}, got ${authTag.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, ENCODING, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generates a new random encryption key (32 bytes, hex-encoded).
 * Useful for initial setup.
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a value using SHA-256 (for non-reversible hashing).
 * Useful for creating state parameters, CSRF tokens, etc.
 */
export function hashSHA256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Generate a cryptographically secure random string.
 * Useful for state parameters, nonces, etc.
 */
export function generateSecureRandom(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}
