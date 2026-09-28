export type ApiKeyUsage = {
  lastUsedAt?: string | null;
  expiresAt?: string | null;
};

export const SETTINGS_LAYOUT = {
  columns: "lg:grid-cols-3",
  profile: "lg:col-span-1",
  apiKeys: "lg:col-span-2",
  danger: "lg:col-span-3",
} as const;

export function spanOf(className: string): number {
  return Number(className.match(/col-span-(\d+)/)?.[1] ?? 0);
}

export function columnsOf(className: string): number {
  return Number(className.match(/grid-cols-(\d+)/)?.[1] ?? 0);
}

export function displayValue(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
}

export function isEmailConfirmed(input: string, email: string): boolean {
  const typed = input.trim().toLowerCase();
  return typed.length > 0 && typed === email.trim().toLowerCase();
}

export function deleteAccountRequest(email: string) {
  return {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  };
}

export function readDeleteAccountError(
  payload: unknown,
  fallback: string,
): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const { error } = payload as { error?: unknown };
    if (typeof error === "string" && error.trim()) return error;
  }
  return fallback;
}

export function describeKeyUsage({ lastUsedAt, expiresAt }: ApiKeyUsage): string {
  const parts = [
    lastUsedAt
      ? `Last used ${new Date(lastUsedAt).toLocaleString()}`
      : "Never used",
  ];

  if (expiresAt) parts.push(`Expires ${new Date(expiresAt).toLocaleString()}`);

  return parts.join(" · ");
}
