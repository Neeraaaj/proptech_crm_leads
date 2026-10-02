import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Postgres error codes we translate into client errors.
// Drizzle wraps driver errors, so the pg error may be on `err.cause`.
const PG_ERRORS: Record<string, { status: number; code: string; message: string }> = {
  "23503": { status: 404, code: "NOT_FOUND", message: "Referenced resource not found" }, // FK violation
  "23505": { status: 409, code: "CONFLICT", message: "Resource already exists" }, // unique violation
  "22P02": { status: 400, code: "BAD_REQUEST", message: "Invalid input syntax" }, // e.g. bad uuid
};

// Express 5 forwards rejected promises from async handlers here automatically,
// so controllers don't need try/catch or an asyncHandler wrapper.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details: err.flatten().fieldErrors },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }

  const pgCode: string | undefined = err?.cause?.code ?? err?.code;
  if (pgCode && PG_ERRORS[pgCode]) {
    const { status, code, message } = PG_ERRORS[pgCode];
    res.status(status).json({ error: { code, message } });
    return;
  }

  // Malformed JSON body
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "BAD_JSON", message: "Malformed JSON body" } });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "production" ? "Something went wrong" : String(err?.message ?? err),
    },
  });
};
