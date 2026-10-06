import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin";
import prisma from "@/src/lib/prisma";
import { slugify } from "@/src/lib/format";
import { LIMITS } from "@/src/lib/config";

function validateFlags(privateValue: unknown, publishedValue: unknown) {
  if (privateValue !== undefined && typeof privateValue !== "boolean") {
    return { error: "private must be a boolean" };
  }
  if (publishedValue !== undefined && typeof publishedValue !== "boolean") {
    return { error: "published must be a boolean" };
  }
  return { error: null };
}

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const resources = await prisma.resource.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      data: true,
      private: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true, username: true, email: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, name, data, private: isPrivate, published } = (body ?? {}) as {
    userId?: string;
    name?: string;
    data?: unknown;
    private?: boolean;
    published?: boolean;
  };

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Resource name is required" }, { status: 400 });
  }
  if (data === undefined || data === null) {
    return NextResponse.json({ error: "Data is required" }, { status: 400 });
  }

  const flags = validateFlags(isPrivate, published);
  if (flags.error) {
    return NextResponse.json({ error: flags.error }, { status: 400 });
  }

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!owner) {
    return NextResponse.json({ error: "Owner user not found" }, { status: 404 });
  }
  if (owner.role !== "user") {
    return NextResponse.json(
      { error: "Resources can only be created for regular users, not administrators" },
      { status: 400 },
    );
  }

  const serializedSize = new TextEncoder().encode(JSON.stringify(data)).length;
  if (serializedSize > LIMITS.MAX_JSON_SIZE) {
    return NextResponse.json(
      { error: `JSON size exceeds the ${Math.floor(LIMITS.MAX_JSON_SIZE / 1024 / 1024)}MB limit` },
      { status: 400 },
    );
  }

  const slug = slugify(name);
  if (!slug) {
    return NextResponse.json({ error: "Resource name cannot be converted to a valid slug" }, { status: 400 });
  }

  const existing = await prisma.resource.findFirst({
    where: { userId, slug },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Resource with this name already exists for the selected user" }, { status: 409 });
  }

  const created = await prisma.resource.create({
    data: {
      userId,
      name: name.trim(),
      slug,
      data,
      private: isPrivate ?? false,
      published: published ?? true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      private: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ resource: created }, { status: 201 });
}