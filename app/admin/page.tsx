"use client";

import { useEffect, useState } from "react";

interface UserAdminItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  maxResources: number;
  _count: { resources: number };
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserAdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async (userId: string, newLimit: number) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, maxResources: newLimit }),
    });
    fetchUsers(); // Refresh data
  };

  if (loading) return <div className="p-8">Memuat data Admin...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-card rounded-lg border">
          <p className="text-sm text-muted">Total Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted p-3">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Username</th>
              <th className="p-3">Role</th>
              <th className="p-3">Resource Used</th>
              <th className="p-3">Max Limit</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name} ({u.email})</td>
                <td className="p-3">@{u.username || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.role === "admin" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3">{u._count.resources} resource</td>
                <td className="p-3">{u.maxResources}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleUpdateLimit(u.id, u.maxResources + 10)}
                    className="text-xs bg-primary text-white px-2 py-1 rounded"
                  >
                    +10 Limit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
