import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import itemRoutes from "./item.routes.js";
import storageRoutes from "./storage.routes.js";
import { getCsrfTokenHandler } from "../middlewares/csrf.middleware.js";

const router = Router();

// Root health check mounted directly
router.use("/", healthRoutes);

// CSRF token acquisition endpoint (GET - safe from CSRF)
router.get("/api/csrf-token", getCsrfTokenHandler);

// API v1 feature routes
router.use("/api/auth", authRoutes);
router.use("/api/items", itemRoutes);
router.use("/api/storage", storageRoutes);

export default router;
