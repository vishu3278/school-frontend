"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useAcademicYears } from "@/lib/academic-years";
import { useAuth } from "@/lib/auth";

type Grade = {
  id: string;
  name: string;
};

type FeeCategory = {
  id: number;
  name: string;
  description: string | null;
};

type FeeStructure = {
  id: number;
  grade_id: string;
  grade_name: string;
  academic_year_id: number;
  academic_year_name: string;
  fee_category_id: number;
  fee_category_name: string;
  amount: string;
  frequency: string;
  due_date: string | null;
};

const FEE_FREQUENCIES = ["annual", "quarterly", "monthly", "one_time"];

const emptyCategoryForm = { name: "", description: "" };

const emptyStructureForm = {
  gradeId: "",
  academicYearId: "",
  feeCategoryId: "",
  amount: "",
  frequency: "annual",
  dueDate: "",
};

export default function FeesPage() {
  const { hasRole } = useAuth();
  const { academicYears } = useAcademicYears();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const [structureForm, setStructureForm] = useState(emptyStructureForm);
  const [editingStructureId, setEditingStructureId] = useState<number | null>(null);
  const [savingStructure, setSavingStructure] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [gradesData, categoriesData, structuresData] = await Promise.all([
        api<Grade[]>("/grades"),
        api<FeeCategory[]>("/fee-categories"),
        api<FeeStructure[]>("/fee-structures"),
      ]);

      setGrades(gradesData);
      setCategories(categoriesData);
      setStructures(structuresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fee data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasRole("admin")) {
      return;
    }

    loadData();
  }, [hasRole]);

  // --- Fee categories ---

  async function handleCategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = categoryForm.name.trim();

    if (!name) {
      setError("Category name is required");
      return;
    }

    setSavingCategory(true);
    setError("");

    try {
      const payload = {
        name,
        description: categoryForm.description.trim() || null,
      };

      if (editingCategoryId) {
        await api(`/fee-categories/${editingCategoryId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/fee-categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fee category");
    } finally {
      setSavingCategory(false);
    }
  }
  async function handleCategoryDelete(id: number) {
    if (!window.confirm("Delete this fee category?")) {
      return;
    }

    try {
      await api(`/fee-categories/${id}`, { method: "DELETE" });

      if (editingCategoryId === id) {
        setEditingCategoryId(null);
        setCategoryForm(emptyCategoryForm);
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fee category");
    }
  }

  function startEditCategory(category: FeeCategory) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
    });
    setError("");
  }

  // --- Fee structures ---

  async function handleStructureSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !structureForm.gradeId ||
      !structureForm.academicYearId ||
      !structureForm.feeCategoryId ||
      !structureForm.amount
    ) {
      setError("Grade, academic year, category and amount are required");
      return;
    }

    setSavingStructure(true);
    setError("");

    try {
      const payload = {
        gradeId: structureForm.gradeId,
        academicYearId: Number(structureForm.academicYearId),
        feeCategoryId: Number(structureForm.feeCategoryId),
        amount: Number(structureForm.amount),
        frequency: structureForm.frequency,
        dueDate: structureForm.dueDate || null,
      };

      if (editingStructureId) {
        await api(`/fee-structures/${editingStructureId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/fee-structures", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setStructureForm(emptyStructureForm);
      setEditingStructureId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fee structure");
    } finally {
      setSavingStructure(false);
    }
  }
  async function handleStructureDelete(id: number) {
    if (!window.confirm("Delete this fee structure?")) {
      return;
    }

    try {
      await api(`/fee-structures/${id}`, { method: "DELETE" });

      if (editingStructureId === id) {
        setEditingStructureId(null);
        setStructureForm(emptyStructureForm);
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fee structure");
    }
  }

  function startEditStructure(structure: FeeStructure) {
    setEditingStructureId(structure.id);
    setStructureForm({
      gradeId: structure.grade_id,
      academicYearId: String(structure.academic_year_id),
      feeCategoryId: String(structure.fee_category_id),
      amount: String(Number(structure.amount)),
      frequency: structure.frequency,
      dueDate: structure.due_date || "",
    });
    setError("");
  }

  if (!hasRole("admin")) {
    return null;
  }

  if (loading) {
    return <main className="p-6">Loading fees...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fees</h1>
        <p className="text-slate-600">
          Manage fee categories and the fee structures charged per grade and
          academic year.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {/* === Fee categories === */}
      <section className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Fee Categories</h2>
        <form
          onSubmit={handleCategorySubmit}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="flex-1">
            <label className="mb-1 block font-medium">Name</label>
            <input
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="e.g. Tuition"
              maxLength={100}
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div className="flex-[2]">
            <label className="mb-1 block font-medium">Description</label>
            <input
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="e.g. Annual tuition fee"
              className="w-full rounded border p-2"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={savingCategory}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {savingCategory
                ? "Saving..."
                : editingCategoryId
                  ? "Save"
                  : "Add category"}
            </button>

            {editingCategoryId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCategoryId(null);
                  setCategoryForm(emptyCategoryForm);
                  setError("");
                }}
                className="rounded bg-slate-200 px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="mt-4 overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-5 text-center text-slate-500">
                    No fee categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="p-3">{category.name}</td>
                    <td className="p-3">{category.description || "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditCategory(category)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCategoryDelete(category.id)}
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
      </section>

      {/* === Fee structures === */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Fee Structures</h2>
        <form
          onSubmit={handleStructureSubmit}
          className="grid gap-3 md:grid-cols-4"
        >
          <div>
            <label className="mb-1 block font-medium">Grade</label>
            <select
              value={structureForm.gradeId}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  gradeId: event.target.value,
                }))
              }
              required
              className="w-full rounded border p-2"
            >
              <option value="">Select grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Academic year</label>
            <select
              value={structureForm.academicYearId}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  academicYearId: event.target.value,
                }))
              }
              required
              className="w-full rounded border p-2"
            >
              <option value="">Select year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                  {year.isCurrent ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Category</label>
            <select
              value={structureForm.feeCategoryId}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  feeCategoryId: event.target.value,
                }))
              }
              required
              className="w-full rounded border p-2"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={structureForm.amount}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              placeholder="e.g. 40000"
              required
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Frequency</label>
            <select
              value={structureForm.frequency}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  frequency: event.target.value,
                }))
              }
              className="w-full rounded border p-2"
            >
              {FEE_FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Due date (optional)</label>
            <input
              type="date"
              value={structureForm.dueDate}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              className="w-full rounded border p-2"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={savingStructure}
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {savingStructure
                ? "Saving..."
                : editingStructureId
                  ? "Save changes"
                  : "Add fee structure"}
            </button>

            {editingStructureId && (
              <button
                type="button"
                onClick={() => {
                  setEditingStructureId(null);
                  setStructureForm(emptyStructureForm);
                  setError("");
                }}
                className="rounded bg-slate-200 px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="mt-4 overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Grade</th>
                <th className="p-3">Academic year</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Due date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-slate-500">
                    No fee structures yet.
                  </td>
                </tr>
              ) : (
                structures.map((structure) => (
                  <tr key={structure.id} className="border-t">
                    <td className="p-3">{structure.grade_name}</td>
                    <td className="p-3">{structure.academic_year_name}</td>
                    <td className="p-3">{structure.fee_category_name}</td>
                    <td className="p-3">
                      Rs. {Number(structure.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">{structure.frequency}</td>
                    <td className="p-3">{structure.due_date || "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditStructure(structure)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStructureDelete(structure.id)}
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
      </section>
    </main>
  );
}
