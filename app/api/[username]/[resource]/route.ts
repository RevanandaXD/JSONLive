import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { authenticateApiKey } from "@/src/lib/api-key";
import { RateLimit, RateLimitExceeded, clientIp, rateLimitError } from "@/src/lib/rate-limit";
import { RATE_LIMIT } from "@/src/lib/config";
import { readJsonBody, jsonBodyError } from "@/src/lib/body";
import { headers } from 'next/headers'
import crypto from 'crypto';

type DbParams = {
  username: string;
  resource: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

function applyReadLimit(request: Request): NextResponse | null {
  try {
    RateLimit(`get:${clientIp(request)}`, RATE_LIMIT.GET.limit, RATE_LIMIT.GET.windowMs);
    return null;
  } catch (err) {
    if (err instanceof RateLimitExceeded) return rateLimitError(err.retryAfter, corsHeaders);
    throw err;
  }
}

function applyWriteLimit(request: Request): NextResponse | null {
  try {
    RateLimit(`write:${clientIp(request)}`, RATE_LIMIT.WRITE.limit, RATE_LIMIT.WRITE.windowMs);
    return null;
  } catch (err) {
    if (err instanceof RateLimitExceeded) return rateLimitError(err.retryAfter, corsHeaders);
    throw err;
  }
}

function nextId(data: unknown[]): number | string {
  const numericIds = data
    .filter((item): item is { id: number } => typeof item === 'object' && item !== null && typeof (item as { id?: unknown }).id === 'number')
    .map((item) => item.id);
  if (numericIds.length > 0) return Math.max(...numericIds) + 1;
  return crypto.randomUUID();
}

async function loadPublishedResource(username: string, resource: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  return prisma.resource.findFirst({
    where: { userId: user.id, slug: resource, published: true },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyReadLimit(request);
  if (limited) return limited;

  const { username, resource } = await params;

  const found = await loadPublishedResource(username, resource);
  if (!found) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  if (found.private) {
    const apiKeyUserId = await authenticateApiKey(request.headers);
    const session = apiKeyUserId ? null : await auth.api.getSession({ headers: await headers() });
    const isAuthorized = apiKeyUserId === found.userId || session?.user.id === found.userId;
    
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }
  }

  return NextResponse.json(found.data, { headers: corsHeaders });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyWriteLimit(request);
  if (limited) return limited;

  const { username, resource } = await params;

  const found = await loadPublishedResource(username, resource);
  if (!found) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  const userId = await authenticateApiKey(request.headers);
  if (!userId || userId !== found.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const data = found.data as unknown;
  if (!Array.isArray(data)) {
    return NextResponse.json(
      { error: "This resource is not a collection. POST is only supported on arrays." },
      { status: 400, headers: corsHeaders },
    );
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonBodyError(parsed, corsHeaders);
  const body = parsed.data;

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "POST body must be a single JSON object" },
      { status: 400, headers: corsHeaders },
    );
  }

  const item = { ...(body as Record<string, unknown>) };
  if (!('id' in item)) {
    item.id = nextId(data);
  }

  await prisma.resource.update({
    where: { id: found.id },
    data: { data: [...data, item] as unknown as object },
  });

  return NextResponse.json(item, { status: 201, headers: corsHeaders });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyWriteLimit(request);
  if (limited) return limited;

  const { username, resource } = await params;

  const found = await loadPublishedResource(username, resource);
  if (!found) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  const userId = await authenticateApiKey(request.headers);
  if (!userId || userId !== found.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonBodyError(parsed, corsHeaders);
  const body = parsed.data;

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "PUT body must be an array to replace the whole collection" },
      { status: 400, headers: corsHeaders },
    );
  }

  await prisma.resource.update({
    where: { id: found.id },
    data: { data: body as unknown as object },
  });

  return NextResponse.json(body, { status: 200, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}