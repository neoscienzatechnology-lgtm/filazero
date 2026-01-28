import crypto from "crypto";

/**
 * Armazenar refresh token puro no banco é ruim.
 * Para o MVP, hash SHA-256 resolve bem e simplifica.
 */
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

