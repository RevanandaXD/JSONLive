import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  requireAdmin,
  isValidSecretCode,
  secretNotConfigured,
} from "@/src/lib/admin";

const ROLES = ["admin", "user"] as const;

type Role = (typeof ROLES)[number];

const SECRET_ACTIONS = ["force-delete", "disable"] as const;

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      maxResource: true,
      disabled: true,
      deleteRequestedAt: true,
      createdAt: true,
      _count: {
        select: { resources: true },
      },
    },
    orderBy: {
      resources: { _count: "desc" },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, role, maxResource, action, secretCode, confirmUsername } = (
    body ?? {}
  ) as {
    userId?: string;
    role?: Role;
    maxResource?: number;
    action?: "cancel-delete" | "force-delete" | "disable" | "enable";
    secretCode?: string;
    confirmUsername?: string;
  };

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (role !== undefined && !ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role must be one of: ${ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  if (maxResource !== undefined && (!Number.isInteger(maxResource) || maxResource < 0)) {
    return NextResponse.json(
      { error: "maxResource must be a non-negative integer" },
      { status: 400 },
    );
  }

  if (action !== undefined && !["cancel-delete", "force-delete", "disable", "enable"].includes(action)) {
    return NextResponse.json(
      { error: "action must be one of: cancel-delete, force-delete, disable, enable" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "force-delete") {
    const expectedUsername = target.username || target.email;
    const provided = (confirmUsername || secretCode || "").trim();
    if (provided !== expectedUsername && !isValidSecretCode(secretCode)) {
      return NextResponse.json(
        { error: `Confirmation does not match. Please enter the user's username ("${expectedUsername}").` },
        { status: 400 },
      );
    }
  }

  if (action === "disable") {
    if (secretNotConfigured()) {
      return NextResponse.json(
        { error: "Admin secret code is not configured on the server" },
        { status: 500 },
      );
    }
    if (!isValidSecretCode(secretCode)) {
      return NextResponse.json(
        { error: "Invalid admin secret code" },
        { status: 403 },
      );
    }
  }

  if (authResult.session.user.id === userId && role !== undefined && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 },
    );
  }

  if (action === "force-delete") {
    if (authResult.session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account from here." },
        { status: 400 }
      );
    }
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "User deleted successfully", deletedUserId: userId });
  }

  if (action === "disable" && authResult.session.user.id === userId) {
    return NextResponse.json(
      { error: "You cannot disable your own admin account." },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(role !== undefined ? { role } : {}),
      ...(maxResource !== undefined ? { maxResource } : {}),
      ...(action === "cancel-delete" ? { deleteRequestedAt: null } : {}),
      ...(action === "disable" || action === "enable"
        ? { disabled: action === "disable", deleteRequestedAt:
            action === "disable" ? null : undefined }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      maxResource: true,
      disabled: true,
      deleteRequestedAt: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}