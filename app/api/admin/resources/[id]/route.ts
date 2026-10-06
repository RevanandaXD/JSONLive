import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin";
import prisma from "@/src/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      data: true,
      private: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: { select: { name: true, username: true, email: true } },
    },
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json({ resource });
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  const existing = await prisma.resource.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  await prisma.resource.delete({ where: { id } });

  return NextResponse.json({ message: "Resource deleted successfully" });
}