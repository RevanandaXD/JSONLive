import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { LIMITS } from "@/src/lib/config";

export async function GET() {
  try {

    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({error: "Unauthorized"}, { status: 401 })
    }

    const response = await prisma.resource.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      status: 200,
      data: response,
    }, { status: 200 })
  } catch { 
    return NextResponse.json({
      status: 500,
      error: 'Internal Server Error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const { name, data, published, private: isPrivate } = await request.json();

    if (!name || data === undefined || data === null) {
      return NextResponse.json({
        status: 400,
        error: "Name and data are required",
      }, { status: 400 })
    }

    const bodySize = new TextEncoder().encode(JSON.stringify(data)).length;
    if (bodySize > LIMITS.MAX_JSON_SIZE) {
      return NextResponse.json({
        status: 400,
        error: `JSON size exceeds ${Math.floor(LIMITS.MAX_JSON_SIZE / 1024 / 1024)}MB limit`
      }, { status: 400 })
    }

    const count = await prisma.resource.count({
      where: { userId }
    });

    if (count >= LIMITS.MAX_RESOURCES) {
      return NextResponse.json({
        status: 400,
        error: `Resource limit reached (max ${LIMITS.MAX_RESOURCES})`
      }, { status: 400 })
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.resource.findFirst({
      where: { userId, slug },
    })

    if (existing) {
      return NextResponse.json({
        status: 409,
        error: "Resource with this name already exists"
      }, { status: 409 })
    }

    const response = await prisma.resource.create({
      data: {
        userId,
        name,
        slug,
        data,
        private: isPrivate ?? false,
        published: published ?? true,
      }
    })

    return NextResponse.json({
      status: 201,
      data: response,
    }, { status: 201 })
  } catch {
    return NextResponse.json({
      status: 500,
      error: 'Internal Server Error',
    }, { status: 500 })
  }
}
