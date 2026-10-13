import { z } from "zod";

/**
 * Native environment variable & file loading in Node.js 24+.
 *
 * Supports both:
 * 1. System/Container environment variables (Docker, Kubernetes, Cloud Providers)
 * 2. Local environment files (.env.local, .env.<NODE_ENV>, and .env)
 *
 * Precedence order:
 * System / Shell / Cloud Environment Variables > .env.local > .env.<NODE_ENV> > .env
 */
const envCandidates = [
  `.env.${process.env.NODE_ENV || "development"}.local`,
  `.env.${process.env.NODE_ENV || "development"}`,
  ".env.local",
  ".env",
];

for (const envPath of envCandidates) {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Silently continue if the file does not exist
  }
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),
  SUPABASE_URL: z
    .string()
    .url({ message: "SUPABASE_URL must be a valid URL" })
    .default("https://your-project.supabase.co"),
  SUPABASE_ANON_KEY: z.string().default("your-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default("your-service-role-key"),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_BUCKET_NAME: z.string().default("uploads"),
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default("900000") // 15 minutes
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .default("100")
    .transform((val) => parseInt(val, 10)),
  COOKIE_SECRET: z
    .string()
    .min(16, { message: "COOKIE_SECRET must be at least 16 characters" })
    .default("super-secret-cookie-encryption-key-min-16"),
  CSRF_SECRET: z
    .string()
    .min(16, { message: "CSRF_SECRET must be at least 16 characters" })
    .default("super-secret-csrf-token-secret-key-min-16"),
  CSRF_ENABLED: z
    .string()
    .default("true")
    .transform((val) => val === "true"),
});

const sanitizeEnv = () => {
  // Normalize empty strings to undefined so Zod defaults apply
  const rawEnv: Record<string, any> = {};
  for (const [key, val] of Object.entries(process.env)) {
    rawEnv[key] = val === "" ? undefined : val;
  }

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.format());
    throw new Error("Invalid environment configuration.");
  }

  const data = parsed.data;
  const serviceKey =
    data.SUPABASE_SERVICE_ROLE_KEY !== "your-service-role-key"
      ? data.SUPABASE_SERVICE_ROLE_KEY
      : data.SUPABASE_SERVICE_KEY || data.SUPABASE_SERVICE_ROLE_KEY;

  return {
    ...data,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    SUPABASE_ANON_KEY:
      data.SUPABASE_ANON_KEY !== "your-anon-key"
        ? data.SUPABASE_ANON_KEY
        : serviceKey,
  };
};

export const env = sanitizeEnv();
export type Env = typeof env;
