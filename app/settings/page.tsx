"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { signOut, useSession } from "@/src/lib/auth-client";

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

        {user?.email && (
          <div className="max-w-2xl">
            <DeleteAccountSection email={user.email} />
          </div>
        )}
      </main>
    </div>
  );
}