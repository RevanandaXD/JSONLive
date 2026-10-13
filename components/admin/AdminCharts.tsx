"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/src/lib/theme";

export interface AdminChartUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  maxResource: number;
  createdAt?: string;
  deleteRequestedAt?: string | null;
  _count: { resources: number };
}

function chartColors(theme: Theme) {
  return theme === "light"
    ? {
        primary: "#16a34a",
        sky: "#0284c7",
        violet: "#7c3aed",
        amber: "#d97706",
        red: "#dc2626",
        muted: "#d4d4d8",
        grid: "#e4e4e7",
        label: "#71717a",
        cursor: "rgba(0,0,0,0.05)",
      }
    : {
        primary: "#22c55e",
        sky: "#38bdf8",
        violet: "#a78bfa",
        amber: "#fbbf24",
        red: "#ef4444",
        muted: "#3f3f46",
        grid: "#27272a",
        label: "#a1a1aa",
        cursor: "rgba(255,255,255,0.04)",
      };
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-card/60 p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-xl">
      {label !== undefined && (
        <p className="mb-1 font-semibold text-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}:{" "}
          <span className="font-mono font-semibold text-foreground">
            {entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

export function AdminCharts({ users }: { users: AdminChartUser[] }) {
  const { theme } = useTheme();
  const CHART_COLORS = chartColors(theme);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const pendingDeletion = users.filter((u) => !!u.deleteRequestedAt).length;
  const regularCount = totalUsers - adminCount - pendingDeletion;

  const roleData = [
    {
      name: "Regular",
      value: Math.max(0, regularCount),
      color: CHART_COLORS.primary,
    },
    { name: "Admin", value: adminCount, color: CHART_COLORS.violet },
    {
      name: "Pending Deletion",
      value: pendingDeletion,
      color: CHART_COLORS.red,
    },
  ].filter((d) => d.value > 0);

  const topUsers = [...users]
    .sort((a, b) => (b._count?.resources || 0) - (a._count?.resources || 0))
    .slice(0, 7)
    .map((u) => ({
      name: (u.name || u.email.split("@")[0]).slice(0, 12),
      resources: u._count?.resources || 0,
      limit: u.maxResource || 20,
    }));

  const signupMap = new Map<string, number>();
  for (const u of users) {
    if (!u.createdAt) continue;
    const d = new Date(u.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    signupMap.set(key, (signupMap.get(key) || 0) + 1);
  }
  const signupData = [...signupMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [year, m] = month.split("-").map(Number);
      return {
        month: new Date(year, m - 1, 1).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        users: count,
      };
    });

  const maxTopResources = Math.max(0, ...topUsers.map((t) => t.resources));

  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-3">
      {/* User Signups Trend */}
      <ChartCard title="User Signups" hint="New registrations per month">
        <div className="h-56">
          {signupData.length === 0 ? (
            <EmptyChart text="No signup data yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={signupData}
                margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: CHART_COLORS.label, fontSize: 11 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART_COLORS.label, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: CHART_COLORS.muted }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="New users"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      {/* Role Distribution */}
      <ChartCard title="Role Distribution" hint="Current account breakdown">
        <div className="h-56">
          {roleData.length === 0 ? (
            <EmptyChart text="No users yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {roleData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {roleData.map((entry) => (
            <span
              key={entry.name}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name} ({entry.value})
            </span>
          ))}
        </div>
      </ChartCard>

      {/* Top Users by Resource Usage */}
      <ChartCard
        title="Top Users by Resource Usage"
        hint="Resources created vs. allocated limit"
      >
        <div className="h-56">
          {maxTopResources === 0 ? (
            <EmptyChart text="No resources created yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topUsers}
                margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: CHART_COLORS.label, fontSize: 11 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART_COLORS.label, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: CHART_COLORS.cursor }}
                />
                <Bar
                  dataKey="resources"
                  name="Resources"
                  fill={CHART_COLORS.primary}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="limit"
                  name="Limit"
                  fill={CHART_COLORS.muted}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-1 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.primary }}
            />
            Resources
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.muted }}
            />
            Limit
          </span>
        </div>
      </ChartCard>
    </div>
  );
}
