/**
 * Throw this anywhere in a controller/service; the error middleware turns it into
 * a consistent JSON response: { error: { code, message, details? } }
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }
  static notImplemented(feature: string) {
    return new ApiError(501, "NOT_IMPLEMENTED", `${feature} is not implemented yet`);
  }
}
