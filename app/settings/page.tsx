"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineExclamationTriangle,
  HiOutlineKey,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { TextInput } from "@/components/ui/Input";
import useApiKeys from "@/hooks/useApiKeys";
import { useSession } from "@/src/lib/auth-client";
import { PUBLIC_BASE_URL } from "@/src/lib/config";
import {
  SETTINGS_LAYOUT,
  deleteAccountRequest,
  describeKeyUsage,
  displayValue,
  isEmailConfirmed,
  readDeleteAccountError,
} from "@/src/lib/settings";

const API_KEYS_DESCRIPTION = (
  <>
    Send a key in the <code className="font-mono text-primary">x-api-key</code>{" "}
    header (or{" "}
    <code className="font-mono text-primary">Authorization: Bearer</code>) to
    authorize POST, PUT, PATCH, and DELETE on your public endpoints.
  </>
);

const PROFILE_FIELDS = ["Name", "Username", "Email"] as const;

const DELETE_ERROR = "Failed to delete account. Please try again.";

export default function SettingsPage() {
  const router = useRouter();
  const { data, isPending: sessionPending } = useSession();
  const user = data?.user;

  const { data: keys, isPending, createKey, isCreating, deleteKey, isDeleting } =
    useApiKeys();

  const [keyName, setKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Read deleteRequestedAt from session user if available
  const userDeleteRequestedAt = (user as { deleteRequestedAt?: string | Date | null })?.deleteRequestedAt;
  const [pendingDeleteDate, setPendingDeleteDate] = useState<string | Date | null>(userDeleteRequestedAt || null);

  // Sync state if user prop changes
  useEffect(() => {
    if (userDeleteRequestedAt === undefined) return;
    void Promise.resolve().then(() => setPendingDeleteDate(userDeleteRequestedAt));
  }, [userDeleteRequestedAt]);

  const profile = {
    Name: user?.name,
    Username: user?.username,
    Email: user?.email,
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setConfirmInput("");
    setDeleteError(null);
  }, []);

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    setKeyError(null);
    try {
      const created = await createKey({ name: keyName.trim() });
      setRevealedKey(created.key);
      setKeyName("");
    } catch (err) {
      setKeyError(
        err instanceof Error ? err.message : "Failed to create API key.",
      );
    }
  };

  const handleDeleteKey = async (id: string) => {
    setKeyError(null);
    try {
      await deleteKey(id);
    } catch (err) {
      setKeyError(
        err instanceof Error ? err.message : "Failed to delete API key.",
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || !isEmailConfirmed(confirmInput, user.email) || deleting)
      return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        "/api/account/delete",
        deleteAccountRequest(user.email),
      );

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setDeleteError(readDeleteAccountError(payload, DELETE_ERROR));
        setDeleting(false);
        return;
      }

      setPendingDeleteDate(payload?.deleteRequestedAt || new Date().toISOString());
      closeModal();
      router.refresh();
    } catch {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/account/cancel-delete", {
        method: "POST",
      });
      if (res.ok) {
        setPendingDeleteDate(null);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to cancel account deletion:", err);
    } finally {
      setCancelling(false);
    }
  };

  if (!user && !sessionPending) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Settings
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile, API keys, and account controls.
          </p>
        </header>

        <div className={`grid gap-5 ${SETTINGS_LAYOUT.columns}`}>
          {/* Profile */}
          <Card className={`h-full ${SETTINGS_LAYOUT.profile}`}>
            <CardHeader icon={HiOutlineUserCircle} title="Profile" />
            <CardBody className="px-5">
              <dl className="divide-y divide-border/60">
                {PROFILE_FIELDS.map((field) => (
                  <div key={field} className="py-3.5">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {field}
                    </dt>
                    <dd className="mt-1 wrap-break-words font-mono text-sm text-foreground">
                      {displayValue(profile[field])}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardBody>
            <CardFooter>
              <p className="text-xs text-muted-foreground">Your endpoints</p>
              <code className="mt-1 block break-all font-mono text-xs text-foreground">
                {PUBLIC_BASE_URL}/api/{user?.username || "username"}
              </code>
            </CardFooter>
          </Card>

          {/* API keys */}
          <Card className={`h-full ${SETTINGS_LAYOUT.apiKeys}`}>
            <CardHeader
              icon={HiOutlineKey}
              title="API Keys"
              description={API_KEYS_DESCRIPTION}
            />

            {revealedKey && (
              <div className="border-b border-border/60 px-5 py-4">
                <Alert tone="warning" title="Save this key now!">
                  The key is shown only once and cannot be viewed again after
                  this page is closed.
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <code className="min-w-0 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                      {revealedKey}
                    </code>
                    <CopyButton
                      value={revealedKey}
                      label="Copy"
                      className="px-3 py-2"
                      ariaLabel="Copy new API key"
                    />
                  </div>
                </Alert>
              </div>
            )}

            <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
              <TextInput
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                placeholder="Key name (e.g. CI/CD, mobile app)"
                aria-label="Key name"
              />
              <Button
                variant="outline"
                onClick={handleCreateKey}
                disabled={!keyName.trim() || isCreating}
              >
                <HiOutlinePlus className="h-4 w-4" />
                {isCreating ? "Creating..." : "Create key"}
              </Button>
            </div>

            {keyError && (
              <p className="px-5 pb-2 text-sm text-red-500" role="alert">
                {keyError}
              </p>
            )}

            <CardBody className="mt-auto border-t border-border/60 px-5 py-4">
              {isPending ? (
                <p className="text-sm text-muted-foreground">
                  Loading API keys...
                </p>
              ) : keys.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No API keys yet. Create one to enable write access.
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {keys.map((apiKey) => (
                    <li
                      key={apiKey.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-border/70 bg-background/40 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {apiKey.name}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {apiKey.keyId}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {describeKeyUsage(apiKey)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="dangerSoft"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        disabled={isDeleting}
                        aria-label={`Delete ${apiKey.name}`}
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Danger zone */}
          {user?.email && (
            <Card tone="danger" className={SETTINGS_LAYOUT.danger}>
              <CardHeader
                icon={HiOutlineExclamationTriangle}
                title="Danger Zone"
                tone="danger"
              />
              {pendingDeleteDate ? (
                <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Account Deletion Pending (3-Day Queue)
                      </p>
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-300">
                        Queued
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Requested on:{" "}
                      <span className="font-mono text-foreground">
                        {new Date(pendingDeleteDate).toLocaleString()}
                      </span>
                      . Scheduled for permanent deletion on:{" "}
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        {new Date(
                          new Date(pendingDeleteDate).getTime() + 3 * 24 * 60 * 60 * 1000
                        ).toLocaleString()}
                      </span>
                      .
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You or an administrator can cancel this request at any time before deletion.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCancelDelete}
                    disabled={cancelling}
                    className="shrink-0 border-emerald-600/40 text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-500/40 dark:text-emerald-400"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Deletion Request"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Delete account
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Puts your account in a 3-day deletion queue. After 3 days, your profile,
                      resources, and public endpoints will be permanently deleted.
                    </p>
                  </div>
                  <Button
                    variant="dangerSoft"
                    onClick={() => setModalOpen(true)}
                    className="shrink-0"
                  >
                    Delete account
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>

      <Modal
        open={modalOpen && !!user?.email}
        onClose={closeModal}
        title="Request account deletion?"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={
                !isEmailConfirmed(confirmInput, user?.email ?? "") || deleting
              }
            >
              {deleting ? "Queueing Deletion..." : "Request Account Deletion"}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your account will enter a <strong className="text-foreground">3-day deletion queue</strong>.
          After 3 days, all your data, resources, and public API endpoints will be permanently removed.
        </p>

        <div className="mt-4">
          <Alert tone="warning">
            You or an admin can cancel this request at any time during the 3-day wait period.
          </Alert>
        </div>

        <label
          htmlFor="confirm-email"
          className="mt-5 block text-sm text-muted-foreground"
        >
          Type your email to confirm:{" "}
          <span className="font-mono text-foreground">{user?.email}</span>
        </label>
        <TextInput
          id="confirm-email"
          autoComplete="off"
          mono
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder="you@email.com"
          className="mt-2"
        />

        {deleteError && (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {deleteError}
          </p>
        )}
      </Modal>
    </div>
  );
}
