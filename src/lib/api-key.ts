import crypto from 'crypto';
import prisma from './prisma';

const PREFIX = "jlv_";

export function generateApiKey() {
    const keyId = crypto.randomBytes(8).toString("hex");
    const secret = crypto.randomBytes(24).toString("hex");
    return {
        keyId,
        secret,
        fullKey: `${PREFIX}${keyId}_${secret}`
    }
}

export function hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest("hex")
}

export function parseApiKey(value: string): {
    keyId: string;
    secret: string;
} | null {
    if (!value.startsWith(PREFIX)) return null;
    const rest = value.slice(PREFIX.length);
    const separator = rest.indexOf("_");
    if (separator <= 0) return null;
    return {
        keyId: rest.slice(0, separator),
        secret: rest.slice(separator + 1)
    }
}

function extractKey(headers: Headers): string | null {
  const auth = headers.get("authorization");
  if (auth) {
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (match) return match[1];
  }
  return headers.get("x-api-key");
}

export async function authenticateApiKey(
  headers: Headers,
): Promise<string | null> {
  const raw = extractKey(headers);
  if (!raw) return null;

  const parsed = parseApiKey(raw);
  if (!parsed) return null;

  const record = await prisma.apiKey.findUnique({
    where: { keyId: parsed.keyId },
  });

  if (!record || record.keyHash !== hashSecret(parsed.secret)) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  await prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return record.userId;
}