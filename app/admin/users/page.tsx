"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Field, PasswordInput, TextInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/src/lib/auth-client";

interface UserAdminItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  maxResource: number;
  disabled: boolean;
  deleteRequestedAt?: string | null;
  createdAt?: string;
  _count: { resources: number };
}

type FilterRole = "all" | "admin" | "user" | "disabled" | "pending-deletion";

interface SecretAction {
  type: "disable" | "delete";
  userId: string;
  name: string;
  email: string;
  username: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const currentUser = sessionData?.user;
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<UserAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("user");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [secretAction, setSecretAction] = useState<SecretAction | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [secretError, setSecretError] = useState<string | null>(null);
  const [secretSubmitting, setSecretSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (active && res.ok && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to fetch admin users:", err);
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUpdateLimit = async (userId: string, newLimit: number) => {
    if (newLimit < 1) return;
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, maxResource: newLimit }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, maxResource: newLimit } : u))
        );
        showNotification("Resource limit updated successfully.");
      }
    } catch (err) {
      console.error("Failed to update limit:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot change your own admin role.");
      return;
    }
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as "admin" | "user" } : u))
        );
        showNotification(`Role updated to ${newRole}.`);
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelUserDeletion = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "cancel-delete" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, deleteRequestedAt: null } : u))
        );
        showNotification("Account deletion request successfully cancelled by admin.");
      }
    } catch (err) {
      console.error("Failed to cancel user deletion:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEnableUser = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "enable" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, disabled: false } : u))
        );
        showNotification("User account has been re-activated.");
      }
    } catch (err) {
      console.error("Failed to enable user:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openSecretModal = (type: SecretAction["type"], user: UserAdminItem) => {
    setSecretError(null);
    setSecretInput("");
    setSecretAction({
      type,
      userId: user.id,
      name: user.name,
      email: user.email,
      username: user.username || user.email,
    });
  };

  const closeSecretModal = () => {
    if (secretSubmitting) return;
    setSecretAction(null);
    setSecretError(null);
    setSecretInput("");
  };

  const submitSecret = async () => {
    if (!secretAction || secretSubmitting) return;
    setSecretSubmitting(true);
    setSecretError(null);
    try {
      const payload: Record<string, unknown> = {
        userId: secretAction.userId,
        action: secretAction.type === "delete" ? "force-delete" : "disable",
      };
      if (secretAction.type === "delete") {
        payload.confirmUsername = secretInput.trim();
      } else {
        payload.secretCode = secretInput.trim();
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSecretError(data.error || "Action failed. Please try again.");
        return;
      }
      if (secretAction.type === "delete") {
        setUsers((prev) => prev.filter((u) => u.id !== secretAction.userId));
        showNotification(`User account ${secretAction.username || secretAction.email} has been permanently deleted.`);
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === secretAction.userId ? { ...u, disabled: true, deleteRequestedAt: null } : u
          )
        );
        showNotification(`User account ${secretAction.email} has been disabled.`);
      }
      setSecretAction(null);
      setSecretInput("");
    } catch (err) {
      console.error("Failed to run secret action:", err);
      setSecretError("Something went wrong. Please try again.");
    } finally {
      setSecretSubmitting(false);
    }
  };

  useEffect(() => {
    if (sessionPending) return;
    if (!currentUser) {
      router.push("/login?callbackURL=%2Fadmin%2Fusers");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [sessionPending, currentUser, isAdmin, router]);

  if (sessionPending || (isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-64">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return null;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.username?.toLowerCase().includes(query.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "pending-deletion" ? !!u.deleteRequestedAt : u.role === roleFilter);
    return matchesSearch && matchesRole;
  });

  const disabledCount = users.filter((u) => u.disabled).length;
  const pendingDeletionCount = users.filter((u) => !!u.deleteRequestedAt).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="lg:pl-64 lg:pt-6">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {successMsg && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 shadow-lg backdrop-blur">
              <HiOutlineCheck className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                User Management
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage user accounts, roles, limits, and deletions. Disabling an account requires
                the admin secret code
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-md">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search user by name, email, or username..."
                ariaLabel="Search users"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start rounded-md border border-border/70 bg-card/60 p-1">
              {(["user", "disabled", "pending-deletion"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setRoleFilter(filter)}
                    className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      roleFilter === filter
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {filter === "user"
                      ? "Regular"
                          : filter === "disabled"
                            ? `Disabled (${disabledCount})`
                            : `Pending Deletion (${pendingDeletionCount})`}
                  </button>
                ),
              )}
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={HiOutlineMagnifyingGlass}
              title="No users found"
              description={
                query
                  ? `No user matches "${query}". Try adjusting your search criteria.`
                  : "No users registered in this category yet."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-md border border-border/70 bg-card/60 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3.5">User Details</th>
                      <th className="px-5 py-3.5">Role & Status</th>
                      <th className="px-5 py-3.5">Resource Usage</th>
                      <th className="px-5 py-3.5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredUsers.map((u) => {
                      const resCount = u._count?.resources || 0;
                      const maxCount = u.maxResource || 20;
                      const ratio = Math.min(1, resCount / maxCount);
                      const isSelf = u.id === currentUser.id;
                      const isPendingDelete = !!u.deleteRequestedAt;
                      const deleteScheduledFor = u.deleteRequestedAt
                        ? new Date(new Date(u.deleteRequestedAt).getTime() + 3 * 24 * 60 * 60 * 1000)
                        : null;

                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors hover:bg-muted/30 ${
                            isPendingDelete ? "bg-red-500/5" : u.disabled ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary">
                                {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-semibold text-foreground">
                                    {u.name || "Unnamed User"}
                                  </p>
                                  {isSelf && (
                                    <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-row items-center gap-1">
                              <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                                {u.role}
                              </span>

                              {u.disabled ? (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                                  <HiOutlineLockClosed className="h-3 w-3" />
                                  DISABLED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                                  <HiOutlineShieldCheck className="h-3 w-3" />
                                  ACTIVE
                                </span>
                              )}

                              {isPendingDelete && (
                                <div className="mt-1 flex flex-col gap-0.5">
                                  <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                                    <HiOutlineClock className="h-3 w-3" />
                                    Queued Deletion (3d)
                                  </span>
                                  <span className="text-[10px] text-red-300/80">
                                    Deletes: {deleteScheduledFor?.toLocaleDateString()} {deleteScheduledFor?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-xs min-w-35">
                              <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
                                <span className="font-semibold text-foreground">{resCount}</span>
                                <span className="text-muted-foreground">/ {maxCount} resources</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded bg-muted/60">
                                <div
                                  className={`h-full rounded transition-all ${
                                    ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${Math.round(ratio * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {isPendingDelete ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleCancelUserDeletion(u.id)}
                                    disabled={updatingId === u.id}
                                    title="Admin: Cancel user deletion request"
                                    className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
                                  >
                                    <HiOutlineXMark className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>

                                  <button
                                    onClick={() => openSecretModal("delete", u)}
                                    disabled={isSelf || updatingId === u.id}
                                    title="Admin: Force immediate deletion (requires secret code)"
                                    className="inline-flex items-center gap-1 rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                                  >
                                    <HiOutlineTrash className="h-3.5 w-3.5" />
                                    Force Delete
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                  {!isSelf && (
                                    <>
                                      {u.disabled ? (
                                        <button
                                          onClick={() => handleEnableUser(u.id)}
                                          disabled={updatingId === u.id}
                                          title="Re-activate this account"
                                          className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40 cursor-pointer"
                                        >
                                          <HiOutlineShieldCheck className="h-3.5 w-3.5" />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => openSecretModal("disable", u)}
                                          disabled={updatingId === u.id}
                                          title="Disable this account (requires secret code)"
                                          className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-40 cursor-pointer"
                                        >
                                          <HiOutlineLockClosed className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => openSecretModal("delete", u)}
                                        disabled={updatingId === u.id}
                                        title="Permanently delete this account (requires secret code)"
                                        className="inline-flex items-center gap-1 rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40 cursor-pointer"
                                      >
                                        <HiOutlineTrash className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                  <div className="inline-flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleUpdateLimit(u.id, Math.max(1, maxCount - 5))}
                                      disabled={maxCount <= 1 || updatingId === u.id}
                                      title="Decrease limit by 5"
                                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-border/70 bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                                    >
                                      <HiOutlineMinus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center font-mono text-xs font-semibold text-foreground">
                                      {maxCount}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateLimit(u.id, maxCount + 1)}
                                      disabled={updatingId === u.id}
                                      title="Increase limit by 5"
                                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-border/70 bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                                    >
                                      <HiOutlinePlus className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateLimit(u.id, maxCount + 5)}
                                      disabled={updatingId === u.id}
                                      className="ml-1 rounded border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
                                    >
                                      +5
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Modal
            open={!!secretAction}
            onClose={closeSecretModal}
            title={secretAction?.type === "delete" ? "Permanently delete user" : "Disable user account"}
            footer={
              <>
                <Button variant="secondary" onClick={closeSecretModal} disabled={secretSubmitting}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={submitSecret}
                  disabled={
                    secretSubmitting ||
                    !secretInput.trim() ||
                    (secretAction?.type === "delete" && secretInput.trim() !== secretAction?.username)
                  }
                >
                  {secretSubmitting
                    ? "Processing..."
                    : secretAction?.type === "delete"
                      ? "Delete account"
                      : "Disable account"}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {secretAction?.type === "delete"
                  ? "This will permanently delete the account and all of its resources. This cannot be undone."
                  : "This will block the user from signing in. They can be re-activated later."}
                {" "}
                Target: <span className="font-semibold text-foreground">
                  {secretAction?.name || secretAction?.email}
                </span>
              </p>

              {secretAction?.type === "delete" ? (
                <Field
                  label="Confirm Username"
                  htmlFor="confirm-delete-username"
                  hint={
                    <span>
                      Please type <strong className="font-mono text-foreground font-semibold">{secretAction.username}</strong> to confirm deletion.
                    </span>
                  }
                >
                  <TextInput
                    id="confirm-delete-username"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder={`Type "${secretAction.username}"`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && secretInput.trim() === secretAction.username && !secretSubmitting) {
                        submitSecret();
                      }
                    }}
                  />
                </Field>
              ) : (
                <Field
                  label="Admin secret code"
                  htmlFor="admin-secret-code"
                  hint="The action can only be confirmed with the ADMIN_ACTION_SECRET code."
                >
                  <PasswordInput
                    id="admin-secret-code"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="Enter secret code"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && secretInput.trim() && !secretSubmitting) {
                        submitSecret();
                      }
                    }}
                  />
                </Field>
              )}

              {secretError && <Alert tone="danger">{secretError}</Alert>}
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}