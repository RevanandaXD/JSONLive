import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { MAX_API_KEYS } from "@/src/lib/config";
import { generateApiKey, hashSecret } from "@/src/lib/api-key";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createAt: "desc" },
      select: {
        id: true,
        name: true,
        keyId: true,
        lastUsedAt: true,
        expiresAt: true,
        createAt: true,
      },
    });

    return NextResponse.json(
      { status: 200, data: response },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { status: 500, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, expiresAt } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { status: 400, error: "Name is required" },
        { status: 400 },
      );
    }

    const count = await prisma.apiKey.count({ where: { userId } });
    if (count >= MAX_API_KEYS) {
      return NextResponse.json(
        { status: 400, error: `API key limit reached (max ${MAX_API_KEYS})` },
        { status: 400 },
      );
    }

    const generated = generateApiKey();

    const record = await prisma.apiKey.create({
      data: {
        userId,
        name: name.trim(),
        keyId: generated.keyId,
        keyHash: hashSecret(generated.secret),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyId: true,
        expiresAt: true,
        createAt: true,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        data: { ...record, key: generated.fullKey },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { status: 500, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}