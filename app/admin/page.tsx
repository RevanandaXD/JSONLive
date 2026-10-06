"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineUsers,
  HiOutlineSquare3Stack3D,
  HiOutlineShieldCheck,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineClock,
} from "react-icons/hi2";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { AdminCharts } from "@/components/admin/AdminCharts";
import { useSession } from "@/src/lib/auth-client";

interface UserAdminItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  maxResource: number;
  deleteRequestedAt?: string | null;
  createdAt?: string;
  _count: { resources: number };
}

export default function AdminPage() {
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const currentUser = sessionData?.user;
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<UserAdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    void Promise.resolve().then(async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (res.ok && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to fetch admin users:", err);
      } finally {
        setLoading(false);
      }
    });
  }, [isAdmin]);



  useEffect(() => {
    if (sessionPending) return;
    if (!currentUser) {
      router.push("/login?callbackURL=%2Fadmin");
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

  // Analytics Metrics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const pendingDeletionCount = users.filter(
    (u) => !!u.deleteRequestedAt,
  ).length;
  const regularCount = totalUsers - adminCount;
  const totalResources = users.reduce(
    (acc, u) => acc + (u._count?.resources || 0),
    0,
  );
  const totalLimitAllocated = users.reduce(
    (acc, u) => acc + (u.maxResource || 20),
    0,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />

      <div className="lg:pl-64 lg:pt-6">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Toast Notification */}


          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Admin Control Panel
                </h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage platform users, roles, and resource allocations in
                real-time.
              </p>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-md border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Users
                </span>
                <HiOutlineUsers className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 font-heading text-3xl font-bold text-foreground">
                {totalUsers}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {regularCount} users · {adminCount} admins
              </p>
            </div>

            <div className="rounded-md border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Active Resources
                </span>
                <HiOutlineSquare3Stack3D className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-2 font-heading text-3xl font-bold text-foreground">
                {totalResources}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Avg{" "}
                {totalUsers > 0 ? (totalResources / totalUsers).toFixed(1) : 0}{" "}
                per user
              </p>
            </div>

            <div className="rounded-md border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Limit Capacity
                </span>
                <HiOutlineAdjustmentsHorizontal className="h-5 w-5 text-sky-400" />
              </div>
              <p className="mt-2 font-heading text-3xl font-bold text-foreground">
                {totalLimitAllocated}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Total slots provisioned
              </p>
            </div>

            <div className="rounded-md border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Admins
                </span>
                <HiOutlineShieldCheck className="h-5 w-5 text-purple-400" />
              </div>
              <p className="mt-2 font-heading text-3xl font-bold text-foreground">
                {adminCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Elevated privilege accounts
              </p>
            </div>

            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  Deletion Queue
                </span>
                <HiOutlineClock className="h-5 w-5 text-red-400" />
              </div>
              <p className="mt-2 font-heading text-3xl font-bold text-red-400">
                {pendingDeletionCount}
              </p>
              <p className="mt-1 text-xs text-red-300/80">
                Pending 3-day deletion
              </p>
            </div>
          </div>

          {/* Analytics Charts */}
          <AdminCharts users={users} />
        </main>
      </div>
    </div>
  );
}
