import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/app-error.js";

/**
 * Middleware that requires a valid Supabase JWT Bearer token.
 * Attaches the authenticated Supabase User object to `req.user`.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication token missing or invalid format (Bearer token expected)");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Bearer token is empty");
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, error?.message || "Invalid or expired authentication token");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Auth middleware: attaches `req.user` if valid token is provided,
 * but allows the request to continue if no token is sent.
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          req.user = user;
          req.token = token;
        }
      }
    }

    next();
  } catch {
    next();
  }
};
