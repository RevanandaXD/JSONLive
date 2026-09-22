import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

type DbParams = {
  id: string;
};

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<DbParams> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.apiKey.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { status: 404, error: "API Key Not Found" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { status: 403, error: "Forbidden: You do not own this API key" },
        { status: 403 },
      );
    }

    await prisma.apiKey.delete({ where: { id } });

    return NextResponse.json({ status: 200, data: { success: true } }, { status: 200 });
  } catch {
    return NextResponse.json(
      { status: 500, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}