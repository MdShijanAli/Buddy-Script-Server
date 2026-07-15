import { randomBytes, scrypt, timingSafeEqual } from "crypto";

// scrypt cost parameters (interactive login use, OWASP-recommended range)
const SCRYPT_N = 16384;
const SCRYPT_R = 16;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 128 * SCRYPT_N * SCRYPT_R * 2;

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: MAX_MEM },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;

  const derivedKey = await deriveKey(password, salt);
  const keyBuffer = Buffer.from(key, "hex");

  if (derivedKey.length !== keyBuffer.length) return false;
  return timingSafeEqual(derivedKey, keyBuffer);
}
