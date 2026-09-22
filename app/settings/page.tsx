"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { signOut, useSession } from "@/src/lib/auth-client";
import useApiKeys from "@/hooks/useApiKeys";
import { HiOutlineClipboardDocument, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}

function DeleteAccountSection({ email }: { email: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches =
    confirmInput.trim().toLowerCase() === email.trim().toLowerCase();

  const handleDelete = async () => {
    if (!matches) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? "Gagal menghapus akun. Coba lagi.");
        setLoading(false);
        return;
      }

      try {
        await signOut();
      } catch {
        // session sudah terhapus di server, aman diabaikan
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-8 rounded-md border border-red-500/30 bg-card/60">
        <div className="border-b border-red-500/20 px-5 py-4">
          <h2 className="text-sm font-semibold text-red-500">Danger Zone</h2>
        </div>
        <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Delete account
            </p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
              Menghapus akun akan menghapus permanen profil, semua resource,
              dan public endpoint kamu. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20"
          >
            Delete account
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete account confirmation"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-bold text-foreground">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Seluruh profil, resource, dan public endpoint akan dihapus secara
              permanen.
            </p>

            <div className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
              Tindakan ini tidak dapat dibatalkan.
            </div>

            <label className="mt-5 block text-sm text-muted-foreground">
              Ketik email kamu untuk konfirmasi:{" "}
              <span className="font-mono text-foreground">{email}</span>
            </label>
            <input
              type="text"
              autoComplete="off"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="kamu@email.com"
              className="mt-2 w-full rounded-md border border-border bg-card px-3.5 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
            />

            {error && (
              <p className="mt-3 text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setConfirmInput("");
                  setError(null);
                }}
                disabled={loading}
                className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!matches || loading}
                className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ApiKeysSection() {
  const {
    data: keys,
    isPending,
    createKey,
    isCreating,
    deleteKey,
    isDeleting,
  } = useApiKeys();
  const [name, setName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setError(null);
    setCopied(false);
    try {
      const created = await createKey({ name: name.trim() });
      setRevealedKey(created.key);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat API key.");
    }
  };

  const copy = async () => {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-8 max-w-2xl rounded-md border border-border/70 bg-card/60">
      <div className="border-b border-border/60 px-5 py-4">
        <h2 className="text-sm font-semibold">API Keys</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Gunakan API key di header <code className="font-mono text-primary">x-api-key</code>{" "}
          (atau <code className="font-mono text-primary">Authorization: Bearer</code>) untuk
          mengotorisasi POST, PUT, PATCH, dan DELETE pada public endpoint kamu.
        </p>
      </div>

      {revealedKey && (
        <div className="border-b border-border/60 px-5 py-4">
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-amber-500">
              Simpan key ini sekarang!
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Key hanya ditampilkan satu kali dan tidak bisa dilihat lagi setelah
              halaman ini ditutup.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                {revealedKey}
              </code>
              <button
                onClick={copy}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <HiOutlineClipboardDocument className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="Nama key (mis. CI/CD, mobile app)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim() || isCreating}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HiOutlinePlus className="h-4 w-4" />
          {isCreating ? "Creating..." : "Create key"}
        </button>
      </div>

      {error && (
        <p className="px-5 pb-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="border-t border-border/60 px-5 py-2">
        {isPending ? (
          <p className="py-3 text-sm text-muted-foreground">Memuat API keys...</p>
        ) : keys.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            Belum ada API key. Buat satu untuk mengaktifkan write access.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {keys.map((key) => (
              <li
                key={key.id}
                className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {key.name}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {key.keyId}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {key.lastUsedAt
                      ? `Terakhir dipakai ${new Date(key.lastUsedAt).toLocaleString()}`
                      : "Belum pernah dipakai"}
                    {key.expiresAt
                      ? ` · Expires ${new Date(key.expiresAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  disabled={isDeleting}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                >
                  <HiOutlineTrash className="h-3.5 w-3.5" />
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user;

  if (!user && !isPending) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Settings
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informasi akun kamu di JSONLive.
          </p>
        </div>

        <div className="max-w-2xl rounded-md border border-border/70 bg-card/60">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-sm font-semibold">Profile</h2>
          </div>
          <dl className="divide-y divide-border/60 px-5 pb-1">
            <Field label="Name" value={user?.name ?? "-"} />
            <Field label="Username" value={user?.username ?? "-"} />
            <Field label="Email" value={user?.email ?? "-"} />
          </dl>
        </div>

        <ApiKeysSection />

        {user?.email && (
          <div className="max-w-2xl">
            <DeleteAccountSection email={user.email} />
          </div>
        )}
      </main>
    </div>
  );
}