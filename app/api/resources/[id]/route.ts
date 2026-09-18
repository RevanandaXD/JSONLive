import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

type DbParams = {
  id: string;
};

async function getSessionOr401() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<DbParams> },
) {
  try {
    const result = await getSessionOr401();
    if ("error" in result) return result.error;

    const { id } = await params;
    const response = await prisma.resource.findUnique({ where: { id } });

    if (!response)
      return NextResponse.json(
        { status: 404, error: "Resource Not Found" },
        { status: 404 },
      );

    if (response.userId !== result.session.user.id) {
      return NextResponse.json(
        { status: 403, error: "Forbidden: You do not own this resource" },
        { status: 403 },
      );
    }

    return NextResponse.json({ status: 200, data: response });
  } catch (err: unknown) {
    return NextResponse.json(
      { status: 500, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  try {
    const result = await getSessionOr401();
    if ("error" in result) return result.error;

    const { id } = await params;
    const { name, data, published } = await request.json();

    const response = await prisma.resource.findUnique({ where: { id } });
    if (!response)
      return NextResponse.json(
        { status: 404, error: "Resource Not Found" },
        { status: 404 },
      );

    if (response.userId !== result.session.user.id) {
      return NextResponse.json(
        { status: 403, error: "Forbidden: You do not own this resource" },
        { status: 403 },
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const updated = await prisma.resource.update({
      where: { id },
      data: { name, slug, data, published },
    });

    return NextResponse.json({ status: 200, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { status: 500, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  try {
    const result = await getSessionOr401();
    if ("error" in result) return result.error;

    const { id } = await params;
    const { published } = await request.json();

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json(
        { status: 404, error: "Resource Not Found" },
        { status: 404 },
      );

    if (existing.userId !== result.session.user.id) {
      return NextResponse.json(
        { status: 403, error: "Forbidden: You do not own this resource" },
        { status: 403 },
      );
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: { published },
    });

    return NextResponse.json({ status: 200, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { status: 500, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<DbParams> },
) {
  try {
    const result = await getSessionOr401();
    if ("error" in result) return result.error;

    const { id } = await params;

    const response = await prisma.resource.findUnique({
      where: { id },
    });

    if (!response)
      return NextResponse.json(
        { status: 404, error: "Resource Not Found" },
        { status: 404 },
      );

    if (response.userId !== result.session.user.id) {
      return NextResponse.json(
        { status: 403, error: "Forbidden: You do not own this resource" },
        { status: 403 },
      );
    }

    const deleted = await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ status: 200, data: deleted });
  } catch (err: unknown) {
    return NextResponse.json(
      { status: 500, error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}