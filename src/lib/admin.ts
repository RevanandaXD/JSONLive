import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { auth } from "./auth";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

export function isValidSecretCode(input?: string): boolean {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret || !input) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(input);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function secretNotConfigured(): boolean {
  return !process.env.ADMIN_ACTION_SECRET;
}