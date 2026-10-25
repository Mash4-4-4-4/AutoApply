import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "../models/User";

export const COOKIE = "ap_session";

export function signSession(userId: string) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: "7d" });
}

export function setSessionCookie(res: Response, userId: string) {
  res.cookie(COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: 7 * 24 * 3600 * 1000,
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Not signed in" });
    res.locals.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
}
