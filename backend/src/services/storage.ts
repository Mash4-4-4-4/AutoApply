import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config";

/** Private local-disk storage. Swap this module for S3-compatible storage in production. */
const root = path.resolve(config.uploadDir);

export function resolveKey(key: string) {
  const full = path.resolve(root, key);
  if (!full.startsWith(root + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export async function saveFile(userId: string, ext: string, data: Buffer) {
  const key = `${userId}/${randomUUID()}${ext}`;
  const full = resolveKey(key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
  return key;
}

export async function deleteFile(key: string) {
  await fs.rm(resolveKey(key), { force: true });
}
