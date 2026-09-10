import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const response = await prisma.resource.findMany({
      where: { userId: 'test' },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      status: 200,
      data: response,
    })
  } catch { 
    return NextResponse.json({
      status: 500,
      error: 'Internal Server Error'
    })
  }
}

export async function POST(request: Request) {

  const MAX_JSON_SIZE = 1 * 1024 * 1024;
  const MAX_RESOURCE_USER = 5;

  try {
    const { name, data } = await request.json();

    if (!name || !data) {
      return NextResponse.json({
        status: 400,
        error: "Name and data are required",
      })
    }

    const bodySize = new TextEncoder().encode(JSON.stringify(data)).length;
    if (bodySize > MAX_JSON_SIZE) {
      return NextResponse.json({
        status: 400,
        error: "JSON size exceeds 1MB limit"
      })
    }
    
    const userId = "default-user-id";

    const count = await prisma.resource.count({
      where: { userId }
    });
    if (count >= MAX_RESOURCE_USER) {
      return NextResponse.json({
        status: 400,
        error: "Resource limit reached (max 20)"
      })
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
      })
    }

    const response = await prisma.resource.create({
      data: {
        userId,
        name,
        slug,
        data,
      }
    })

    return NextResponse.json({
      status: 201,
      data: response,
    })
  } catch {
    return NextResponse.json({
      status: 500,
      error: 'Internal Error Server',
    })
  }
}
