import { Request } from "express";
import { validationResult } from "express-validator";
import { ZodSchema } from "zod";

export interface ValidationErrorItem {
  source: string;
  field: string;
  message: string;
  code?: string;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationErrorItem[] = [],
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class HybridValidator {
  // Validate using Express Validator
  static validateExpress(req: Request): void {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new ValidationError(
        "Validation failed",
        errors.array().map((err) => ({
          source: "express-validator",
          field: err.type === "field" ? String(err.path) : err.type,
          message: err.msg,
        })),
      );
    }
  }

  // Validate using Zod
  static validateZod<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ValidationError(
        "Validation failed",
        result.error.issues.map((issue) => ({
          source: "zod",
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      );
    }

    return result.data;
  }

  // Combined validation: Express Validator + Zod
  static validateAll<T>(req: Request, zodSchema?: ZodSchema<T>): T {
    // Step 1: Express Validator
    this.validateExpress(req);

    // Step 2: Zod validation (if schema provided)
    if (zodSchema) {
      return this.validateZod(zodSchema, req.body);
    }

    return req.body as T;
  }

  // Sanitize user object
  static sanitizeUser(user: any): any {
    if (!user) return user;

    const userObj = user.toObject ? user.toObject() : user;
    const { password, __v, ...sanitized } = userObj;
    return sanitized;
  }
}

// Convenience middleware for Zod validation
export const validateZod = (schema: ZodSchema<any>) => {
  return (req: Request, res: any, next: any) => {
    try {
      req.body = HybridValidator.validateZod(schema, req.body);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          errors: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
};
