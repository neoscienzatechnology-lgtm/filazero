import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function signAccessToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn
  });
}

export function signRefreshToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; role: string };
}

