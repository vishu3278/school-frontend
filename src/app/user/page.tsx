"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Profile = Record<string, unknown> & {
  id: string;
  email: string | null;
  role: string;
};

const roleStyles: Record<string, string> = {
  admin: "bg-violet-100 text-violet-800 ring-violet-200",
  teacher: "bg-blue-100 text-blue-800 ring-blue-200",
  staff: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  student: "bg-amber-100 text-amber-800 ring-amber-200",
};

function fieldLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function fieldValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

export default function UserPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !user) return;

    async function loadProfile() {
      try {
        setError("");
        setProfile(await api<Profile>("/auth/profile"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your account information.");
      }
    }

    loadProfile();
  }, [token, user]);

  useEffect(() => {
    if (user === null && token === null && !localStorage.getItem("school_auth_token")) {
      router.replace("/login");
    }
  }, [router, token, user]);

  if (!user || !token) return <p className="text-slate-600">Loading your account...</p>;

  const account = profile ?? user;
  const role = account.role.toLowerCase();
  const roleClass = roleStyles[role] ?? "bg-slate-100 text-slate-800 ring-slate-200";
  const fields = Object.entries(account).filter(([key, value]) => (
    !["role", "isActive", "password"].includes(key) && value !== null && value !== undefined && value !== ""
  ));

  return (
    <section className="mx-auto max-w-8xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">My account</p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Your profile</h2>
      <p className="mt-2 text-slate-600">Your current signed-in account information.</p>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white ">
          <div className="flex flex-col gap-4 bg-gradient-to-t from-slate-100 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{account.email ?? "Account"}</p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide ring-1 ${roleClass}`}>
              {role}
            </span>
          </div>

          <dl className="divide-y divide-slate-100">
            {fields.map(([key, value]) => {
              if (key === "photo") {
                return (  
                  <div key={key} className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">{fieldLabel(key)}</dt>
                  <dd className="break-words text-sm font-medium text-slate-900 sm:col-span-2"> 
                  <img src={fieldValue(value) as string} alt="Profile photo" className="h-24 w-24 rounded object-cover" />
                  </dd>
                  </div>
                )
              } else {
                return ( 
                  <div key={key} className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">{fieldLabel(key)}</dt>
                  <dd className="break-words text-sm font-medium text-slate-900 sm:col-span-2">{fieldValue(value)}</dd>
                  </div>
                )
              }
            })}
              
          </dl>
        </div>
      )}
    </section>
  );
}
