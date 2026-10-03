import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";

const ROLES = ["admin", "user"] as const;

type Role = (typeof ROLES)[number];

async function requireAdmin() {
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

  const { userId, role, maxResource, action } = (body ?? {}) as {
    userId?: string;
    role?: Role;
    maxResource?: number;
    action?: "cancel-delete" | "force-delete";
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

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(role !== undefined ? { role } : {}),
      ...(maxResource !== undefined ? { maxResource } : {}),
      ...(action === "cancel-delete" ? { deleteRequestedAt: null } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      maxResource: true,
      deleteRequestedAt: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}