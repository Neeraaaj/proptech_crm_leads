import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

type Schemas = { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny };

/**
 * Validates and *replaces* req.body / req.params with parsed (coerced, trimmed) values.
 * Parsed query goes on res.locals.query because Express 5 makes req.query a read-only getter.
 * A ZodError thrown here is turned into a 400 by the error handler.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, res, next) => {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) res.locals.query = schemas.query.parse(req.query);
    next();
  };
