"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { api } from "@/lib/api";

type UserDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  phone?: string | null;
  highestEducation?: string | null;
  institution?: string | null;
  yearOfPassing?: string | null;
  address?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  photo?: string | null;
};

const fields: Array<[keyof UserDetail, string]> = [
  ["phone", "Phone"],
  ["gender", "Gender"],
  ["highestEducation", "Highest education"],
  ["institution", "Institution / university / board / school"],
  ["yearOfPassing", "Year of passing"],
  ["maritalStatus", "Marital status"],
  ["address", "Address"],
];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api<UserDetail>(`/users/${id}`)
      .then(setUser)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="p-6">Loading user details...</main>;
  if (error) return <main className="p-6"><p className="rounded bg-red-100 p-4 text-red-700">{error}</p></main>;
  if (!user) return <main className="p-6"><p>User not found.</p></main>;

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User details</h1>
          <p className="text-gray-600">{user.firstName} {user.lastName}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/users/${user.id}/edit`} className="rounded bg-blue-600 px-4 py-2 text-white">Edit</Link>
          <Link href="/admin/users" className="rounded bg-gray-200 px-4 py-2">Back</Link>
        </div>
      </div>

      <div className="grid gap-6 rounded border bg-white p-6 shadow-sm md:grid-cols-2">
        {user.photo && (
          <div className="md:col-span-2">
            <Image src={user.photo} alt={`${user.firstName} ${user.lastName}`} width={128} height={128} className="h-32 w-32 rounded object-cover" unoptimized />
          </div>
        ) || (
          <div className="md:col-span-2">
            <div className="flex h-32 w-32 items-center justify-center rounded bg-gray-200 text-gray-400">No photo</div>
          </div>
        )}
        <div><p className="text-sm text-gray-500">Full name</p><p className="font-semibold">{user.firstName} {user.lastName}</p></div>
        <div><p className="text-sm text-gray-500">Email</p><p>{user.email}</p></div>
        <div><p className="text-sm text-gray-500">Role</p><p className="capitalize">{user.role}</p></div>
        <div><p className="text-sm text-gray-500">Status</p><p>{user.isActive ? "Active" : "Inactive"}</p></div>
        {fields.map(([key, label]) => (
          <div key={key} className={key === "address" ? "md:col-span-2" : ""}>
            <p className="text-sm text-gray-500">{label}</p>
            <p>{user[key] || "-"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
