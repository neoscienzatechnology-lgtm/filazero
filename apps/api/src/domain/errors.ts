export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(opts: {
    message: string;
    statusCode: number;
    code: string;
    details?: unknown;
  }) {
    super(opts.message);
    this.statusCode = opts.statusCode;
    this.code = opts.code;
    this.details = opts.details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super({ message, statusCode: 401, code: "UNAUTHORIZED" });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado") {
    super({ message, statusCode: 403, code: "FORBIDDEN" });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Não encontrado") {
    super({ message, statusCode: 404, code: "NOT_FOUND" });
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requisição inválida", details?: unknown) {
    super({ message, statusCode: 400, code: "BAD_REQUEST", details });
  }
}

