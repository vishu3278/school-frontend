"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { api } from "@/lib/api";

type Grade = {
  id: string;
  name: string;
};

type StudentDetail = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  phone2?: string | null;
  email?: string | null;
  address?: string | null;
  password?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  aadharNo?: string | null;
  religion?: string | null;
  grade: Grade;
  createdAt?: string;
  updatedAt?: string;
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function loadStudent() {
      try {
        setLoading(true);
        setError("");

        const data = await api<StudentDetail>(`/students/${id}`);
        setStudent(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load student details",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id]);

  if (loading) {
    return <main className="p-6">Loading student details...</main>;
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/students" className="text-blue-600 hover:underline">
            ← Back to students
          </Link>
        </div>
        <p className="rounded bg-red-100 p-4 text-red-700">{error}</p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/students" className="text-blue-600 hover:underline">
            ← Back to students
          </Link>
        </div>
        <p className="text-gray-700">Student not found.</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Details</h1>
          <p className="text-gray-600">Admission No: {student.admissionNo}</p>
        </div>

        <Link href="/students" className="rounded bg-gray-200 px-4 py-2">
          Back
        </Link>
      </div>

      <div className="grid gap-6 rounded border bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Full name</p>
          <p className="text-lg font-semibold">
            {student.firstName} {student.lastName}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Grade</p>
          <p className="text-lg font-semibold">{student.grade?.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Date of birth</p>
          <p>{student.dateOfBirth || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Gender</p>
          <p>{student.gender || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p>{student.phone || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phone 2</p>
          <p>{student.phone2 || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p>{student.email || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Aadhar Number</p>
          <p>{student.aadharNo || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Religion</p>
          <p>{student.religion || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Mother's Name</p>
          <p>{student.motherName || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Father's Name</p>
          <p>{student.fatherName || "-"}</p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Address</p>
          <p>{student.address || "-"}</p>
        </div>
      </div>
    </main>
  );
}
