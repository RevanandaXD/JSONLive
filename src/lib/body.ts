import { NextResponse } from "next/server";
import { LIMITS } from "./config";

export type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; status: 400 | 413 };

async function readLimited(
  request: Request,
  maxBytes: number,
): Promise<{ text: string } | { error: string; status: 413 }> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) {
    return { error: `Body exceeds ${maxBytes} bytes`, status: 413 };
  }

  const body = request.body;
  if (!body) return { text: "" };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return { error: `Body exceeds ${maxBytes} bytes`, status: 413 };
    }
    chunks.push(value);
  }

  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(buf) };
}

export async function readJsonBody(
  request: Request,
  maxBytes: number = LIMITS.MAX_JSON_SIZE,
): Promise<JsonBodyResult> {
  const read = await readLimited(request, maxBytes);
  if ("error" in read) return { ok: false, ...read };

  try {
    return { ok: true, data: JSON.parse(read.text) };
  } catch {
    return { ok: false, error: "Invalid JSON body", status: 400 };
  }
}

export function jsonBodyError(
  result: Extract<JsonBodyResult, { ok: false }>,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(
    { error: result.error },
    { status: result.status, headers },
  );
}
