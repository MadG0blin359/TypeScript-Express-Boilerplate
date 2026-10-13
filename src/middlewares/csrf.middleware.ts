import { Request, Response, NextFunction } from "express";
import { doubleCsrf } from "csrf-csrf";
import { env } from "../config/env.js";

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  getSessionIdentifier: (req: Request) => req.user?.id || req.ip || "anonymous",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req: Request) => {
    return (
      (req.headers["x-csrf-token"] as string) ||
      (req.body && req.body._csrf)
    );
  },
});

export { generateCsrfToken };

/**
 * Endpoint handler to issue a CSRF token to frontend applications.
 * Sets the httpOnly cookie and returns the token in JSON.
 */
export const getCsrfTokenHandler = (req: Request, res: Response): void => {
  const token = generateCsrfToken(req, res);
  res.status(200).json({
    success: true,
    csrfToken: token,
    message: "CSRF token generated successfully",
  });
};

/**
 * CSRF Protection Middleware.
 * Enforces Double Submit Cookie verification on state-changing requests (POST, PUT, PATCH, DELETE).
 *
 * Exemption: Pure Bearer token requests that have not established a cookie session
 * (e.g. CLI, Postman, Swagger UI, or native mobile clients) are permitted, as CSRF
 * only affects browser-managed cookie credentials.
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!env.CSRF_ENABLED) {
    return next();
  }

  // Safe read-only HTTP methods are exempt
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Pure Bearer-token requests without browser cookies are immune to CSRF
  const hasBearerAuth = req.headers.authorization?.startsWith("Bearer ");
  const hasCsrfCookie =
    Boolean(req.cookies && req.cookies["x-csrf-token"]) ||
    Boolean(req.signedCookies && req.signedCookies["x-csrf-token"]);

  if (hasBearerAuth && !hasCsrfCookie) {
    return next();
  }

  doubleCsrfProtection(req, res, next);
};

export default csrfProtection;
