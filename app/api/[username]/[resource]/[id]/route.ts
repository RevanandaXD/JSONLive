import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { authenticateApiKey } from "@/src/lib/api-key";
import { RateLimit, RateLimitExceeded, clientIp, rateLimitError } from "@/src/lib/rate-limit";
import { RATE_LIMIT } from "@/src/lib/config";
import { headers } from 'next/headers'

type DbParams = {
  username: string;
  resource: string;
  id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

function applyReadLimit(request: Request): NextResponse | null {
  try {
    RateLimit(clientIp(request), RATE_LIMIT.GET.limit, RATE_LIMIT.GET.windowMS);
    return null;
  } catch (err) {
    if (err instanceof RateLimitExceeded) return rateLimitError(err.retryAfter, corsHeaders);
    throw err;
  }
}

function applyWriteLimit(request: Request): NextResponse | null {
  try {
    RateLimit(clientIp(request), RATE_LIMIT.WRITE.limit, RATE_LIMIT.WRITE.windowMS);
    return null;
  } catch (err) {
    if (err instanceof RateLimitExceeded) return rateLimitError(err.retryAfter, corsHeaders);
    throw err;
  }
}

function toComparisonId(id: string): number | string {
  const num = Number(id);
  return Number.isFinite(num) && String(num) === id.trim() ? num : id;
}

async function loadPublishedResource(
  username: string,
  resource: string,
) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  return prisma.resource.findFirst({
    where: { userId: user.id, slug: resource, published: true },
  });
}

async function findItem(found: { id: string; userId: string; data: unknown }, id: string): Promise<{
  data: unknown[];
  item: Record<string, unknown> | undefined;
  index: number;
} | null> {
  const data = found.data as unknown;
  if (!Array.isArray(data)) return null;

  const compId = toComparisonId(id);
  const item = data.find((entry) =>
    typeof entry === 'object' && entry !== null && (entry as Record<string, unknown>).id === compId,
  );
  return {
    data,
    item: item as Record<string, unknown> | undefined,
    index: item === undefined ? -1 : data.indexOf(item),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyReadLimit(request);
  if (limited) return limited;

  const { username, resource, id } = await params;

  const found = await loadPublishedResource(username, resource);
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

  const collection = await findItem(found, id);
  if (!collection) {
    return NextResponse.json(
      { error: "This resource is not a collection" },
      { status: 400, headers: corsHeaders },
    );
  }
  if (!collection.item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  return NextResponse.json(collection.item, { headers: corsHeaders });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyWriteLimit(request);
  if (limited) return limited;

  const { username, resource, id } = await params;

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

  const collection = await findItem(found, id);
  if (!collection) {
    return NextResponse.json(
      { error: "This resource is not a collection" },
      { status: 400, headers: corsHeaders },
    );
  }
  const { data, item, index } = collection;
  if (!item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "PUT body must be a single JSON object" },
      { status: 400, headers: corsHeaders },
    );
  }

  const replacement = { ...(body as Record<string, unknown>) };
  const compId = item.id;
  const next = [...data];
  next[index] = 'id' in replacement ? replacement : { ...replacement, id: compId };

  await prisma.resource.update({
    where: { id: found.id },
    data: { data: next as unknown as object },
  });

  return NextResponse.json(next[index], { status: 200, headers: corsHeaders });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyWriteLimit(request);
  if (limited) return limited;

  const { username, resource, id } = await params;

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

  const collection = await findItem(found, id);
  if (!collection) {
    return NextResponse.json(
      { error: "This resource is not a collection" },
      { status: 400, headers: corsHeaders },
    );
  }
  const { data, item, index } = collection;
  if (!item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "PATCH body must be a single JSON object" },
      { status: 400, headers: corsHeaders },
    );
  }

  const next = [...data];
  next[index] = { ...item, ...(body as Record<string, unknown>) };

  await prisma.resource.update({
    where: { id: found.id },
    data: { data: next as unknown as object },
  });

  return NextResponse.json(next[index], { status: 200, headers: corsHeaders });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const limited = applyWriteLimit(request);
  if (limited) return limited;

  const { username, resource, id } = await params;

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

  const collection = await findItem(found, id);
  if (!collection) {
    return NextResponse.json(
      { error: "This resource is not a collection" },
      { status: 400, headers: corsHeaders },
    );
  }
  const { data, item, index } = collection;
  if (!item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  const next = [...data];
  next.splice(index, 1);

  await prisma.resource.update({
    where: { id: found.id },
    data: { data: next as unknown as object },
  });

  return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}