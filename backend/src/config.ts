import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET ?? "dev-secret-change-me";
if (isProd && jwtSecret === "dev-secret-change-me") {
  throw new Error("JWT_SECRET must be set in production");
}

export const config = {
  isProd,
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/applypilot",
  jwtSecret,
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  aiServiceToken: process.env.AI_SERVICE_TOKEN ?? "",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
