"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
} from "react-icons/hi2";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useSession } from "@/src/lib/auth-client";
import { formatBytes, timeAgo, slugify } from "@/src/lib/format";
import { FormatJSON } from "@/app/dashboard/new/format";

interface AdminResourceItem {
  id: string;
  name: string;
  slug: string;
  data: unknown;
  private: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    email: string;
  };
}

interface AdminUserItem {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: "admin" | "user";
}

type FilterTab = "all" | "public" | "draft" | "private";

function parseJson(value: string): { ok: boolean; error?: string } {
  if (!value.trim()) return { ok: true };
  try {
    JSON.parse(value);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function visibilityOf(resource: AdminResourceItem): "public" | "draft" | "private" {
  if (!resource.published) return "draft";
  if (resource.private) return "private";
  return "public";
}

export default function ResourcePage() {
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const currentUser = sessionData?.user;
  const isAdmin = currentUser?.role === "admin";

  const [resources, setResources] = useState<AdminResourceItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [resourceToDelete, setResourceToDelete] = useState<AdminResourceItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [ownerId, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [data, setData] = useState("");
  const [touched, setTouched] = useState(false);
  const [published, setPublished] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/admin/resources");
      const dataJson = await res.json();
      if (res.ok && Array.isArray(dataJson.resources)) {
        setResources(dataJson.resources);
      }
    } catch (err) {
      console.error("Failed to fetch admin resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const dataJson = await res.json();
      if (res.ok && Array.isArray(dataJson.users)) {
        setUsers(dataJson.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    void Promise.resolve().then(async () => {
      await fetchUsers();
      await fetchResources();
    });
  }, [isAdmin]);

  useEffect(() => {
    if (sessionPending) return;
    if (!currentUser) {
      router.push("/login?callbackURL=%2Fadmin%2Fresource");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [sessionPending, currentUser, isAdmin, router]);

  const parsed = useMemo(() => parseJson(data), [data]);
  const previewSlug = useMemo(() => slugify(name), [name]);

  const regularUsers = useMemo(() => users.filter((u) => u.role === "user"), [users]);

  const openCreate = () => {
    setOwnerId("");
    setName("");
    setData("");
    setTouched(false);
    setPublished(true);
    setIsPrivate(false);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const format = (indent: number) => {
    if (!parsed.ok) {
      setTouched(true);
      return;
    }
    setData(JSON.stringify(JSON.parse(data), null, indent));
    setTouched(false);
  };

  const openDeleteModal = (resource: AdminResourceItem) => {
    setResourceToDelete(resource);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
    setResourceToDelete(null);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/resources/${resourceToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== resourceToDelete.id));
        showNotification(`Resource "${resourceToDelete.name}" deleted.`);
        closeDeleteModal();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || "Failed to delete resource");
      }
    } catch (err) {
      console.error("Failed to delete resource:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async () => {
    if (!ownerId) {
      setFormError("Please select a user.");
      return;
    }
    if (!name.trim()) {
      setFormError("Resource name is required.");
      return;
    }
    if (!parsed.ok) {
      setFormError("JSON is invalid. Fix the errors before saving.");
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: ownerId,
          name: name.trim(),
          data: JSON.parse(data),
          published,
          private: isPrivate,
        }),
      });
      const dataJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(dataJson.error || "Failed to create resource.");
        return;
      }
      setModalOpen(false);
      await fetchResources();
      showNotification("Resource created.");
    } catch (err) {
      console.error("Failed to create resource:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const owner = r.user?.username || r.user?.name || r.user?.email || "";
      const matchesSearch =
        r.name?.toLowerCase().includes(query.toLowerCase()) ||
        r.slug?.toLowerCase().includes(query.toLowerCase()) ||
        owner.toLowerCase().includes(query.toLowerCase());
      const vis = visibilityOf(r);
      const matchesTab =
        filterTab === "all" || vis === filterTab;
      return matchesSearch && matchesTab;
    });
  }, [resources, query, filterTab]);

  const tabCounts = useMemo(
    () => ({
      public: resources.filter((r) => visibilityOf(r) === "public").length,
      draft: resources.filter((r) => visibilityOf(r) === "draft").length,
      private: resources.filter((r) => visibilityOf(r) === "private").length,
    }),
    [resources],
  );

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
                Resource Management
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and delete resources for users. Administrators cannot create their own.
              </p>
            </div>
            <Button variant="primary" onClick={openCreate}>
              <HiOutlinePlus className="h-4 w-4" />
              Create Resource
            </Button>
          </div>

          <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-md">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search resource by name, slug, or owner..."
                ariaLabel="Search resources"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start rounded-md border border-border/70 bg-card/60 p-1">
              {(["all", "public", "draft", "private"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filterTab === tab
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {tab === "all" ? "All" : tab === "public" ? `Public (${tabCounts.public})` : tab === "draft" ? `Draft (${tabCounts.draft})` : `Private (${tabCounts.private})`}
                </button>
              ))}
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <EmptyState
              icon={HiOutlineMagnifyingGlass}
              title="No resources found"
              description={
                query
                  ? `No resource matches "${query}". Try adjusting your search criteria.`
                  : "No resources exist yet. Create one to get started."
              }
              action={
                <Button variant="primary" onClick={openCreate}>
                  <HiOutlinePlus className="h-4 w-4" />
                  Create Resource
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-md border border-border/70 bg-card/60 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3.5">Resource</th>
                      <th className="px-5 py-3.5">Owner</th>
                      <th className="px-5 py-3.5">Visibility</th>
                      <th className="px-5 py-3.5">Size</th>
                      <th className="px-5 py-3.5">Updated</th>
                      <th className="px-5 py-3.5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredResources.map((r) => {
                      const vis = visibilityOf(r);
                      const ownerLabel =
                        r.user?.username || r.user?.name || r.user?.email || "—";

                      return (
                        <tr key={r.id} className="transition-colors hover:bg-muted/30">
                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate font-semibold text-foreground">{r.name}</p>
                            <p className="truncate font-mono text-xs text-muted-foreground">
                              /{ownerLabel}/{r.slug}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="truncate text-foreground">{r.user?.name || "—"}</p>
                            <p className="truncate text-xs text-muted-foreground">{r.user?.email}</p>
                          </td>
                          <td className="px-5 py-4">
                            <Badge tone={vis === "public" ? "emerald" : vis === "private" ? "violet" : "amber"}>
                              {vis.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                            {formatBytes(new Blob([JSON.stringify(r.data)]).size)}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">
                            {timeAgo(new Date(r.updatedAt))}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openDeleteModal(r)}
                                disabled={deleting && resourceToDelete?.id === r.id}
                                title="Delete resource"
                                className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-500/40 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40 cursor-pointer"
                              >
                                <HiOutlineTrash className="h-3.5 w-3.5" />
                              </button>
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
            open={modalOpen}
            onClose={closeModal}
            title="Create Resource"
            footer={
              <>
                <Button variant="secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreate} disabled={saving}>
                  {saving ? "Saving..." : "Create resource"}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              {formError && <Alert tone="danger">{formError}</Alert>}

              <Field
                label="Owner user"
                htmlFor="resource-owner"
                hint="Regular users only. Select who this resource belongs to."
              >
                <select
                  id="resource-owner"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  <option value="">Select a user...</option>
                  {regularUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || "Unnamed"} ({u.email})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Resource name" htmlFor="resource-name">
                <TextInput
                  id="resource-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. users"
                />
                {previewSlug && ownerId && (
                  <p className="mt-2 truncate rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    /{regularUsers.find((u) => u.id === ownerId)?.username || (regularUsers.find((u) => u.id === ownerId)?.name || "user")}/{previewSlug}
                  </p>
                )}
              </Field>

              <div className="overflow-hidden rounded-md border border-border/70 focus-within:border-primary">
                <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    {touched && !parsed.ok ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                        Invalid JSON
                      </span>
                    ) : parsed.ok && data.trim() ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                        Valid JSON
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">JSON data</span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {formatBytes(new Blob([data]).size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => format(2)} type="button">
                      Format
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => format(0)} type="button">
                      Minify
                    </Button>
                  </div>
                </div>
                <FormatJSON
                  value={data}
                  onChange={(v) => {
                    setData(v);
                    setTouched(true);
                  }}
                  placeholder='{"name": "Revan", "role": "Developer"}'
                  invalid={touched && !parsed.ok}
                  className="h-44"
                />
              </div>

              <Switch
                label="Publish to public API"
                checked={published}
                onChange={setPublished}
              />
              <Switch
                label="Require authentication"
                tone="amber"
                checked={isPrivate}
                onChange={setIsPrivate}
              />
            </div>
          </Modal>

          <Modal
            open={deleteModalOpen}
            onClose={closeDeleteModal}
            title="Delete Resource"
            footer={
              <>
                <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete resource"}
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{resourceToDelete?.name}&rdquo;
                </span>
                ?
              </p>
              {resourceToDelete && (
                <div className="rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
                  /{resourceToDelete.user?.username || resourceToDelete.user?.name || resourceToDelete.user?.email}/{resourceToDelete.slug}
                </div>
              )}
              <p className="text-xs text-red-400">
                This action cannot be undone. All data in this endpoint will be permanently erased.
              </p>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}