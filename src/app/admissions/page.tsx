"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Application = { id: string; applicationNo: string; firstName: string; lastName: string; academicYear: string; status: string; requestedGrade: { name: string } };

export default function AdmissionsPage() {
  const { hasRole } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api<Application[]>("/admissions").then(setApplications).catch((err) => setError(err instanceof Error ? err.message : "Failed to load applications")).finally(() => setLoading(false)); }, []);
  return <main><div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold">Admissions</h1><p className="text-slate-600">Manage admission applications</p></div><Link href="/admissions/new" className="rounded bg-blue-600 px-4 py-2 text-white">New Application</Link></div>{loading ? <p>Loading applications...</p> : error ? <p className="text-red-600">{error}</p> : <div className="overflow-x-auto rounded border"><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-3">Application No.</th><th className="p-3">Student</th><th className="p-3">Requested Grade</th><th className="p-3">Academic Year</th><th className="p-3">Status</th>{hasRole("admin") && <th className="p-3">Actions</th>}</tr></thead><tbody>{applications.length ? applications.map((application) => <tr key={application.id} className="border-t"><td className="p-3">{application.applicationNo}</td><td className="p-3">{application.firstName} {application.lastName}</td><td className="p-3">{application.requestedGrade.name}</td><td className="p-3">{application.academicYear}</td><td className="p-3"><span className="rounded bg-slate-100 px-2 py-1 text-sm">{application.status}</span></td>{hasRole("admin") && <td className="p-3"><Link href={`/admissions/${application.id}/edit`} className="text-blue-600 hover:underline">Edit</Link></td>}</tr>) : <tr><td colSpan={hasRole("admin") ? 6 : 5} className="p-6 text-center text-slate-500">No applications yet.</td></tr>}</tbody></table></div>}</main>;
}
