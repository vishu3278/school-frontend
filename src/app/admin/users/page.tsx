"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "teacher" | "student" | "staff";
  isActive: boolean;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "student",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, hasRole, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !hasRole("admin")) {
      router.replace("/login");
      return;
    }

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await api<User[]>("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [hasRole, router, token, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        password: form.password.trim(),
      };

      const createdUser = await api<User>("/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "User creation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this user?");

    if (!confirmed) {
      return;
    }

    try {
      await api(`/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((currentUsers) => currentUsers.filter((entry) => entry.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  if (!user || !hasRole("admin")) {
    return null;
  }

  if (loading) {
    return <main className="p-6">Loading users...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-600">Create and manage role-based accounts</p>
        </div>

        <Link href="/admin" className="rounded bg-gray-200 px-4 py-2">
          Back to admin
        </Link>
      </div>

      <div className="mb-6 rounded border bg-white p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">First name</label>
            <input
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Last name</label>
            <input
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="w-full rounded border p-2"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>

        {error && <div className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="px-4 py-3">{entry.firstName} {entry.lastName}</td>
                <td className="px-4 py-3">{entry.email}</td>
                <td className="px-4 py-3 capitalize">{entry.role}</td>
                <td className="px-4 py-3">{entry.isActive ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(entry.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
