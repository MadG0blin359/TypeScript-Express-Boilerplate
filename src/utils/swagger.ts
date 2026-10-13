import { Application } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "TypeScript Express Supabase API",
    version: "1.0.0",
    description: "Production-ready REST API boilerplate built with TypeScript, Express, and Supabase.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase Auth access token",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message details" },
          statusCode: { type: "number", example: 400 },
        },
      },
      SignUpRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 6, example: "Secret123!" },
          fullName: { type: "string", example: "Jane Doe" },
        },
      },
      SignInRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "Secret123!" },
        },
      },
      Item: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" },
          user_id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Liveness probe",
        responses: {
          200: { description: "Service is running" },
        },
      },
    },
    "/ready": {
      get: {
        summary: "Readiness probe",
        description: "Checks connectivity to Supabase database",
        responses: {
          200: { description: "Service and Supabase are ready" },
          503: { description: "Service or Supabase is unavailable" },
        },
      },
    },
    "/api/csrf-token": {
      get: {
        tags: ["Security"],
        summary: "Get CSRF Token and set signed cookie",
        description: "Returns a CSRF token for browser applications to include in the 'x-csrf-token' header on mutating requests.",
        responses: {
          200: {
            description: "CSRF token generated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    csrfToken: { type: "string", example: "csrf-token-sample-string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register new user via Supabase Auth",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignUpRequest" } } },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Invalid input" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user and get Supabase session/JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignInRequest" } } },
        },
        responses: {
          200: { description: "Login successful with session tokens" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Authenticated user details" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/items": {
      get: {
        tags: ["Items"],
        summary: "Get all items (with optional pagination)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of items retrieved" },
        },
      },
      post: {
        tags: ["Items"],
        summary: "Create a new item",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  completed: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Item created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/items/{id}": {
      get: {
        tags: ["Items"],
        summary: "Get item by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Item details" },
          404: { description: "Item not found" },
        },
      },
      patch: {
        tags: ["Items"],
        summary: "Update item by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  completed: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Item updated" },
          404: { description: "Item not found" },
        },
      },
      delete: {
        tags: ["Items"],
        summary: "Delete item by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Item deleted" },
          404: { description: "Item not found" },
        },
      },
    },
    "/api/storage/upload": {
      post: {
        tags: ["Storage"],
        summary: "Upload a file to Supabase Storage",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "File uploaded successfully" },
        },
      },
    },
  },
};

export const setupSwagger = (app: Application): void => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
