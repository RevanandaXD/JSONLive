export const PUBLIC_BASE_URL = "http://localhost:3000";

export const DEFAULT_USERNAME = "User";

export const LIMITS = {
  MAX_JSON_SIZE: 5 * 1024 * 1024,
  MAX_RESOURCES: 5,
};

export const RATE_LIMIT = {
  GET: { limit: 500, windowMS: 60_000 },
  WRITE: { limit:  100, windowMS: 60_000}
};

export const MAX_API_KEYS = 5;

export const STORAGE_LIMIT = LIMITS.MAX_JSON_SIZE * LIMITS.MAX_RESOURCES;