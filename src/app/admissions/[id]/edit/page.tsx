"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdmissionForm, { AdmissionApplication } from "@/components/admissions/AdmissionForm";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Grade = { id: string; name: string };

export default function EditAdmissionPage() {
  const params = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<AdmissionApplication>(`/admissions/${params.id}`), api<Grade[]>("/grades")])
      .then(([nextApplication, nextGrades]) => { setApplication(nextApplication); setGrades(nextGrades); })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load application"));
  }, [params.id]);

  const isReadOnly = application?.status === "APPROVED" || application?.status === "CANCELLED";
  const canEdit = !isReadOnly && (hasRole("admin") || (hasRole("teacher") && application?.status === "DRAFT"));
  return <main><div className="mb-6 flex items-start justify-between"><div><h1 className="text-2xl font-bold">Edit Admission</h1><p className="text-slate-600">Update application details or status</p></div><Link href="/admissions" className="rounded border border-slate-300 px-4 py-2 text-slate-700">Back to Admissions</Link></div>{error ? <p className="rounded bg-red-100 p-3 text-red-700">{error}</p> : application ? <AdmissionForm grades={grades} application={application} canChangeStatus={canEdit} canEdit={canEdit} /> : <p>Loading application...</p>}</main>;
}
