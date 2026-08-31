"use client";

import { useEffect, useState } from "react";

import StudentForm from "@/components/students/StudentForm";
import { api } from "@/lib/api";

type Grade = {
  id: string;
  name: string;
};

export default function NewStudentPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGrades() {
      try {
        setLoading(true);
        setError("");

        const data = await api<Grade[]>("/grades");
        setGrades(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load grades",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGrades();
  }, []);

  if (loading) {
    return <main className="p-6">Loading grades...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Student</h1>

        <p className="text-gray-600">Enter student details</p>
      </div>

      {error ? (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      ) : (
        <StudentForm grades={grades} />
      )}
    </main>
  );
}
