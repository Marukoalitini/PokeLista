import * as Crypto from 'expo-crypto';

const PASSWORD_SALT = 'pokelista_v2_salt_2026';

// Generates a SHA-256 hash so passwords are never stored in plain text
export async function hashPassword(password: string): Promise<string> {
  const saltedInput = `${PASSWORD_SALT}:${password.trim()}`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, saltedInput);
}
