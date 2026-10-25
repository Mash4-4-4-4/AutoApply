import mongoose from "mongoose";
import { config } from "./config";
import { createApp } from "./app";
import { logger } from "./logger";

async function main() {
  await mongoose.connect(config.mongoUri);
  logger.info("MongoDB connected");
  createApp().listen(config.port, () => logger.info(`API on http://localhost:${config.port}`));
}
main().catch((e) => {
  logger.error(e, "Failed to start");
  process.exit(1);
});
