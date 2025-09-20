import { HttpStatusCode } from "../core/constants";

// lib/errors/custom-error.ts
export class CustomError extends Error {
    statusCode: number;
    details?: any;
  
    constructor(message: string, statusCode: number = HttpStatusCode.ServerError, details?: any) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.details = details;
      
      // Maintain proper stack trace (only needed if you're targeting ES5)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  // Example specific error types
  export class NotFoundError extends CustomError {
    constructor(message = "Resource not found", details?: any) {
      super(message, 404, details);
    }
  }
  
  export class UnauthorizedError extends CustomError {
    constructor(message = "Unauthorized", details?: any) {
      super(message, 401, details);
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message = "Validation failed", details?: any) {
      super(message, 400, details);
    }
  }