import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

type DbParams = {
  id: string;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  try {
    const { id } = await params;
    const { name, data } = await request.json();

    const response = await prisma.resource.findUnique({ where: { id } });
    if (!response)
      return NextResponse.json(
        { status: 404, error: "Resource Not Found" },
        { status: 404 },
      );

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const updated = await prisma.resource.update({
      where: { id },
      data: { name, slug, data },
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
    const { id } = await params;

    const response = await prisma.resource.findUnique({
      where: { id },
    });

    if (!response)
      return NextResponse.json(
        { status: 404, error: "Resource Not Found" },
        { status: 404 },
      );

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
