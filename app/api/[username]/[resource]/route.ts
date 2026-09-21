import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from 'next/headers'

type DbParams = {
  username: string;
  resource: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const { username, resource } = await params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: corsHeaders },
    );
  }

const found = await prisma.resource.findFirst({
    where: { userId: user.id, slug: resource, published: true },
  });

  if (!found) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  if (found.private) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.id !== found.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }
  }

  return NextResponse.json(found.data, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
