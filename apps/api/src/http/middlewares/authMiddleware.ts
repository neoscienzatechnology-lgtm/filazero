import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UnauthorizedError } from "../../domain/errors";

export type AuthPayload = {
  sub: string;
  role: "ADMIN" | "OPERATOR" | "CLIENT";
};

declare global {
  // eslint-disable-next-line no-var
  var __authPayloadBrand: unknown;
}

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthPayload;
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new UnauthorizedError();

  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.auth = decoded;
    next();
  } catch {
    throw new UnauthorizedError("Token inválido");
  }
}

