export type ErrorCode =
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_VIOLATION"
  | "DUPLICATE_ENTRY"
  | "INSUFFICIENT_STOCK"
  | "INVALID_OPERATION"
  | "EXTERNAL_SERVICE_ERROR"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(entity: string, id?: string): AppError {
    return new AppError("NOT_FOUND", id ? entity + " not found: " + id : entity + " not found");
  }

  static permissionDenied(action: string): AppError {
    return new AppError("PERMISSION_DENIED", "Permission denied: " + action);
  }

  static validationError(message: string, details?: Record<string, unknown>): AppError {
    return new AppError("VALIDATION_ERROR", message, details);
  }

  static insufficientStock(productName: string, available: number, requested: number): AppError {
    return new AppError("INSUFFICIENT_STOCK", "Insufficient stock for " + productName + ": " + available + " available, " + requested + " requested", { available, requested });
  }

  static businessRule(message: string): AppError {
    return new AppError("BUSINESS_RULE_VIOLATION", message);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
