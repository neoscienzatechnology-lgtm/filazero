import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../../domain/errors";

export function requireRole(roles: Array<"ADMIN" | "OPERATOR" | "CLIENT">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw new UnauthorizedError();
    if (!roles.includes(req.auth.role)) throw new ForbiddenError();
    next();
  };
}

