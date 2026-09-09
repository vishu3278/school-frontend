"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (!user || !hasRole("admin")) {
      router.replace("/login");
    }
  }, [hasRole, router, user]);

  if (!user || !hasRole("admin")) {
    return null;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">System administration area</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Link
          href="/admin/users"
          className="rounded border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
        >
          <h2 className="mb-2 font-semibold">Users</h2>
          <p className="text-gray-600">Manage staff, teachers, and admins.</p>
        </Link>

        <Link
          href="/admissions"
          className="rounded border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
        >
          <h2 className="mb-2 font-semibold">Admissions</h2>
          <p className="text-gray-600">Manage student applications and enrollments.</p>
        </Link>

        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Academic Records</h2>
          <p className="text-gray-600">
            Review grades and student performance.
          </p>
        </div>

        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Reporting</h2>
          <p className="text-gray-600">
            Monitor compliance and activity across the school.
          </p>
        </div>
      </div>
    </main>
  );
}
