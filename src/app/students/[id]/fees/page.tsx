"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import StudentFeeCollection from "@/components/fees/StudentFeeCollection";

export default function StudentFeesPage() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  if (!hasRole("admin")) return null;
  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Fees</h1>
          <p className="text-slate-600">
            Review invoices and collect a full or partial payment.
          </p>
        </div>
        <Link
          href={`/students/${id}`}
          className="rounded bg-slate-200 px-4 py-2"
        >
          Back to student
        </Link>
      </div>
      <StudentFeeCollection studentId={id} />
    </main>
  );
}
