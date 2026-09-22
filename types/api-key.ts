export type ApiKey = {
  id: string;
  name: string;
  keyId: string;
  key: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createAt: string;
};