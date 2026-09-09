"use client";

import { useEffect, useState } from "react";
import AdmissionForm from "@/components/admissions/AdmissionForm";
import { api } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

type Grade = { id: string; name: string };

export default function NewAdmissionPage() {
  const { hasRole } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api<Grade[]>("/grades")
      .then(setGrades)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load grades"),
      );
  }, []);
  return (
    <main>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Admission</h1>
          <p className="text-slate-600">Create an admission application</p>
        </div>
        <Link
          href="/admissions"
          className="rounded border border-slate-300 px-4 py-2 text-slate-700"
        >
          Back to Admissions
        </Link>
      </div>
      {error ? (
        <p className="rounded bg-red-100 p-3 text-red-700">{error}</p>
      ) : (
        <AdmissionForm grades={grades} canChangeStatus={hasRole("admin")} />
      )}
    </main>
  );
}
