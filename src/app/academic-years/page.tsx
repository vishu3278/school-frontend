"use client";

import { FormEvent, useState } from "react";

import { AcademicYear, useAcademicYears } from "@/lib/academic-years";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

const emptyForm = { name: "", startDate: "", endDate: "", isCurrent: false };

export default function AcademicYearsPage() {
  const { hasRole } = useAuth();
  const { academicYears, loading, error: loadError, replace } = useAcademicYears();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!hasRole("admin")) return null;

  function startEdit(academicYear: AcademicYear) {
    setEditingId(academicYear.id);
    setForm({ name: academicYear.name, startDate: academicYear.startDate, endDate: academicYear.endDate, isCurrent: academicYear.isCurrent });
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, name: form.name.trim() };
      const saved = await api<AcademicYear>(editingId ? `/academic-years/${editingId}` : "/academic-years", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      replace(saved);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save academic year");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Academic Years</h1>
        <p className="text-slate-600">
          Manage the academic years available across the school system.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mb-6 grid gap-4 rounded border bg-white p-4 shadow-sm md:grid-cols-3"
      >
        <label>
          Name
          <input
            required
            maxLength={20}
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="e.g. 2026-2027"
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        {/* <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={form.isCurrent} onChange={(event) => setForm((current) => ({ ...current, isCurrent: event.target.checked }))} />
          Set as current academic year
        </label> */}
        <label>
          Start date
          <input
            required
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startDate: event.target.value,
              }))
            }
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label>
          End date
          <input
            required
            type="date"
            value={form.endDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                endDate: event.target.value,
              }))
            }
            className="mt-1 w-full rounded border p-2"
          />
        </label>
            <ToggleSwitch
              label="Set as current academic year"
              checked={form.isCurrent}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, isCurrent: checked }))
              }
            />
            <div>&nbsp;</div>
        <div className="flex items-center gap-2">
          <button
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add academic year"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setError("");
              }}
              className="rounded bg-slate-200 px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
        {(error || loadError) && (
          <p className="rounded bg-red-100 p-3 text-red-700 md:col-span-2">
            {error || loadError}
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Start date</th>
              <th className="p-3">End date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-5 text-center">
                  Loading academic years...
                </td>
              </tr>
            ) : academicYears.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-5 text-center text-slate-500">
                  No academic years configured.
                </td>
              </tr>
            ) : (
              academicYears.map((academicYear) => (
                <tr key={academicYear.id} className="border-t">
                  <td className="p-3">{academicYear.name}</td>
                  <td className="p-3">{academicYear.startDate}</td>
                  <td className="p-3">{academicYear.endDate}</td>
                  <td className="p-3">
                    {academicYear.isCurrent ? "Current" : ""}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => startEdit(academicYear)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
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
