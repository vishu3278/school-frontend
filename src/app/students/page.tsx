"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

import StudentTable, { Student } from "@/components/students/StudentTable";

import { api } from "@/lib/api";

export default function StudentsPage() {
  const { hasRole } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const data = await api<Student[]>("/students");

      setStudents(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load students",
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api(`/students/${id}`, {
        method: "DELETE",
      });

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== id),
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete student",
      );
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) {
    return <main className="p-6">Loading students...</main>;
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>

          <p className="text-gray-600">Manage school students</p>
        </div>

          {hasRole("admin") && (
        <div className="flex gap-3">
            <Link
              href="/grades"
              className="rounded bg-gray-200 px-4 py-2 text-gray-800"
            >
              Manage Grades
            </Link>
          <Link
            href="/students/new"
            className="rounded bg-blue-600 px-4 py-2 text-white"
            >
            Add Student
          </Link>
        </div>
          )}
      </div>

      <StudentTable students={students} onDelete={deleteStudent} />
    </main>
  );
}
