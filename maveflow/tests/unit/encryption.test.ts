import { describe, it, expect, vi } from "vitest";
import { encryptToken, decryptToken } from "../../src/lib/encryption";
import crypto from "crypto";

// Mock environment variable
process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");

describe("Encryption Library", () => {
  it("should encrypt and successfully decrypt a Google OAuth token", () => {
    const rawToken = "ya29.a0AfB_byCdefG123456789";
    
    const encrypted = encryptToken(rawToken);
    expect(encrypted).toContain(":"); // Format should be iv:authTag:encryptedData
    expect(encrypted).not.toEqual(rawToken);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(rawToken);
  });

  it("should fail decryption if payload is tampered", () => {
    const rawToken = "ya29.secretToken123";
    const encrypted = encryptToken(rawToken);
    
    // Tamper with the encrypted data
    const parts = encrypted.split(":");
    const tampered = \`\${parts[0]}:\${parts[1]}:bad\${parts[2]}\`;

    expect(() => decryptToken(tampered)).toThrowError();
  });
});
