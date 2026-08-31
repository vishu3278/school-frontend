"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type Grade = {
  id: string;
  name: string;
};

const emptyForm = { name: "" };

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadGrades() {
    try {
      setLoading(true);
      setError("");

      const data = await api<Grade[]>("/grades");
      setGrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load grades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      setError("Grade name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        const updatedGrade = await api<Grade>(`/grades/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ name: trimmedName }),
        });

        setGrades((currentGrades) =>
          currentGrades.map((grade) =>
            grade.id === editingId ? updatedGrade : grade,
          ),
        );
      } else {
        const createdGrade = await api<Grade>("/grades", {
          method: "POST",
          body: JSON.stringify({ name: trimmedName }),
        });

        setGrades((currentGrades) => [createdGrade, ...currentGrades]);
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this grade?");

    if (!confirmed) {
      return;
    }

    try {
      await api(`/grades/${id}`, {
        method: "DELETE",
      });

      setGrades((currentGrades) =>
        currentGrades.filter((grade) => grade.id !== id),
      );

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete grade");
    }
  }

  function startEdit(grade: Grade) {
    setEditingId(grade.id);
    setForm({ name: grade.name });
    setError("");
  }

  if (loading) {
    return <main className="p-6">Loading grades...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grades</h1>
          <p className="text-gray-600">Manage school grades</p>
        </div>

        <Link href="/students" className="rounded bg-gray-200 px-4 py-2">
          Back to Students
        </Link>
      </div>

      <div className="mb-6 rounded border bg-white p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <label className="mb-1 block font-medium">
              {editingId ? "Update grade" : "Grade name"}
            </label>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="e.g. Grade 4"
              className="w-full rounded border p-2"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {saving ? (editingId ? "Saving..." : "Creating...") : editingId ? "Save" : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setError("");
                }}
                className="rounded bg-gray-200 px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-3 rounded bg-red-100 p-3 text-red-700">{error}</div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                  No grades found.
                </td>
              </tr>
            ) : (
              grades.map((grade) => (
                <tr key={grade.id} className="border-t">
                  <td className="px-4 py-3">{grade.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(grade)}
                        className="text-green-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
