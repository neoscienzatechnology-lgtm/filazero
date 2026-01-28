import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors";
import { ZodError } from "zod";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Dados inválidos" },
      issues: err.issues
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  console.error("[api] unhandled error", err);
  return res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "Erro interno" }
  });
}

