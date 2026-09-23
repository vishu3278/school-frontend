"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAcademicYears } from "@/lib/academic-years";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

type Subject = {
  id: number;
  name: string;
  code: string | null;
  isElective: boolean;
};

type Grade = {
  id: string;
  name: string;
};

type AcademicYear = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type Section = {
  id: string;
  name: string;
  grade: Grade;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type GradeSubject = {
  id: number;
  gradeId: string;
  grade_name: string;
  subjectId: number;
  subject_name: string;
  subject_code: string | null;
  academicYearId: number;
  academic_year_name: string;
  isElective: boolean;
};

type SectionSubject = {
  id: number;
  sectionId: string;
  section_name: string;
  grade_name: string;
  subjectId: number;
  subject_name: string;
  subject_code: string | null;
  teacherId: string | null;
  teacher_email: string | null;
};

const emptySubjectForm = { name: "", code: "", isElective: false };

export default function SubjectsPage() {
  const { hasRole } = useAuth();
  const { currentAcademicYear } = useAcademicYears();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [gradeAssignments, setGradeAssignments] = useState<GradeSubject[]>([]);
  const [sectionAssignments, setSectionAssignments] = useState<SectionSubject[]>([]);

  const [subjectForm, setSubjectForm] = useState({ ...emptySubjectForm });
  const [editingId, setEditingId] = useState<number | null>(null);

  const [gradeAssignForm, setGradeAssignForm] = useState({
    gradeId: "",
    subjectId: 0,
    academicYearId: 0,
    isElective: false,
  });

  const [sectionAssignForm, setSectionAssignForm] = useState({
    sectionId: "",
    subjectId: 0,
    teacherId: "",
  });

  const [savingSubject, setSavingSubject] = useState(false);
  const [savingGradeAssign, setSavingGradeAssign] = useState(false);
  const [savingSectionAssign, setSavingSectionAssign] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [subjectsData, gradesData, yearsData, sectionsData, usersData, gradeAssnData, sectionAssnData] =
        await Promise.all([
          api<Subject[]>("/subjects"),
          api<Grade[]>("/grades"),
          api<AcademicYear[]>("/academic-years"),
          api<Section[]>("/sections"),
          api<User[]>("/users"),
          api<GradeSubject[]>("/subjects/grade-subjects"),
          api<SectionSubject[]>("/subjects/section-subjects"),
        ]);

      setSubjects(subjectsData);
      setGrades(gradesData);
      setAcademicYears(yearsData);
      setSections(sectionsData);
      setTeachers(usersData.filter((u) => u.role === "teacher"));
      setGradeAssignments(gradeAssnData);
      setSectionAssignments(sectionAssnData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentAcademicYear && !gradeAssignForm.academicYearId) {
      setGradeAssignForm((f) => ({ ...f, academicYearId: currentAcademicYear.id }));
    }
  }, [currentAcademicYear, gradeAssignForm.academicYearId]);

  async function handleSubjectSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSubject(true);
    setError("");

    try {
      const name = subjectForm.name.trim();
      if (!name) {
        setError("Subject name is required");
        return;
      }

      const payload = {
        name,
        code: subjectForm.code.trim() || null,
        isElective: subjectForm.isElective,
      };

      if (editingId) {
        const updated = await api<Subject>(`/subjects/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSubjects((current) =>
          current.map((s) => (s.id === editingId ? updated : s)),
        );
        setEditingId(null);
      } else {
        const created = await api<Subject>("/subjects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSubjects((current) => [created, ...current]);
      }

      setSubjectForm({ ...emptySubjectForm });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subject");
    } finally {
      setSavingSubject(false);
    }
  }

  function startEditSubject(subject: Subject) {
    setEditingId(subject.id);
    setSubjectForm({
      name: subject.name,
      code: subject.code || "",
      isElective: subject.isElective,
    });
    setError("");
  }

  async function handleDeleteSubject(id: number) {
    const confirmed = window.confirm("Delete this subject?");
    if (!confirmed) return;

    try {
      await api(`/subjects/${id}`, { method: "DELETE" });
      setSubjects((current) => current.filter((s) => s.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setSubjectForm({ ...emptySubjectForm });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete subject");
    }
  }

  async function handleGradeAssignSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingGradeAssign(true);
    setError("");

      try {
        const result = await api<GradeSubject>("/subjects/assign/grade", {
          method: "POST",
          body: JSON.stringify({
            gradeId: gradeAssignForm.gradeId,
            subjectId: gradeAssignForm.subjectId,
            academicYearId: gradeAssignForm.academicYearId,
            isElective: gradeAssignForm.isElective,
          }),
        });
        setGradeAssignments((current) => [result, ...current]);
        setGradeAssignForm({ gradeId: "", subjectId: 0, academicYearId: 0, isElective: false });
      } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign subject to grade");
    } finally {
      setSavingGradeAssign(false);
    }
  }

  async function handleSectionAssignSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSectionAssign(true);
    setError("");

    try {
      const result = await api<SectionSubject>("/subjects/assign/section", {
        method: "POST",
        body: JSON.stringify({
          sectionId: sectionAssignForm.sectionId,
          subjectId: sectionAssignForm.subjectId,
          teacherId: sectionAssignForm.teacherId || null,
        }),
      });
      setSectionAssignments((current) => [result, ...current]);
      setSectionAssignForm({ sectionId: "", subjectId: 0, teacherId: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign subject to section");
    } finally {
      setSavingSectionAssign(false);
    }
  }

  if (!hasRole("admin")) {
    return null;
  }

  if (loading) {
    return <main className="p-6">Loading subjects...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-gray-600">
            Manage subjects, grade assignments, and section assignments
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      {/* === Subject CRUD === */}
      <div className="grid grid-cols-4 gap-2 mb-8">

      <div className="col-span-1 rounded-lg border bg-slate-50 p-4 ">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit Subject" : "Add Subject"}
        </h2>

        <form
          onSubmit={handleSubjectSubmit}
          className="flex flex-col gap-3 "
          >
          <div className="flex-1">
            <label className="mb-1 block font-medium">Subject Name</label>
            <input
              value={subjectForm.name}
              onChange={(e) =>
                setSubjectForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="e.g. Mathematics"
              className="w-full rounded bg-white border p-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-medium">Code</label>
            <input
              value={subjectForm.code}
              onChange={(e) =>
                setSubjectForm((f) => ({ ...f, code: e.target.value }))
              }
              placeholder="e.g. MATH101"
              className="w-full rounded bg-white border p-2"
            />
          </div>
          {/* <label className="flex items-center gap-2 whitespace-nowrap pb-2">
            <input
              type="checkbox"
              checked={subjectForm.isElective}
              onChange={(e) =>
              setSubjectForm((f) => ({ ...f, isElective: e.target.checked }))
              }
              />
              Elective
              </label> */}
          <ToggleSwitch
            label="Elective"
            checked={subjectForm.isElective}
            onCheckedChange={(checked) =>
              setSubjectForm((f) => ({ ...f, isElective: checked }))
            }
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingSubject}
              className="rounded cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
            >
              {savingSubject ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setSubjectForm({ ...emptySubjectForm });
                  setError("");
                }}
                className="rounded cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="col-span-3 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Elective</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No subjects found.
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id} className="border-t">
                  <td className="px-4 py-3">{subject.name}</td>
                  <td className="px-4 py-3">{subject.code || "—"}</td>
                  <td className="px-4 py-3">
                    {subject.isElective ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEditSubject(subject)}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
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
                </div>

      <div className="grid grid-cols-4 gap-2 mb-8">

      {/* === Assign to Grade === */}
      <div className=" rounded-lg border bg-white p-4 ">
        <h2 className="mb-4 text-lg font-semibold">Assign Subject to Grade</h2>

        <form
          onSubmit={handleGradeAssignSubmit}
          className="flex flex-col gap-3 "
        >
          <div className="flex-1">
            <label className="mb-1 block font-medium">Grade</label>
            <select
              value={gradeAssignForm.gradeId}
              onChange={(e) =>
                setGradeAssignForm((f) => ({ ...f, gradeId: e.target.value }))
              }
              className="w-full rounded border p-2"
              required
            >
              <option value="">Select grade</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-medium">Subject</label>
            <select
              value={gradeAssignForm.subjectId || ""}
              onChange={(e) =>
                setGradeAssignForm((f) => ({
                  ...f,
                  subjectId: Number(e.target.value),
                }))
              }
              className="w-full rounded border p-2"
              required
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-medium">Academic Year</label>
            <select
              value={gradeAssignForm.academicYearId || ""}
              onChange={(e) =>
                setGradeAssignForm((f) => ({
                  ...f,
                  academicYearId: Number(e.target.value),
                }))
              }
              className="w-full rounded border p-2"
              required
            >
              <option value="">Select year</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name}
                </option>
              ))}
            </select>
          </div>
          {/* <label className="flex items-center gap-2 whitespace-nowrap pb-2">
            <input
              type="checkbox"
              checked={gradeAssignForm.isElective}
              onChange={(e) =>
                setGradeAssignForm((f) => ({
                  ...f,
                  isElective: e.target.checked,
                }))
              }
            />
            Elective
          </label> */}
          <ToggleSwitch label="Elective" checked={gradeAssignForm.isElective} onCheckedChange={(checked) => setGradeAssignForm((f) => ({ ...f, isElective: checked }))} />
          <button
            type="submit"
            disabled={savingGradeAssign}
            className="rounded cursor-pointer bg-green-600 hover:bg-green-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {savingGradeAssign ? "Assigning..." : "Assign to Grade"}
          </button>
        </form>
      </div>

      {gradeAssignments.length > 0 && (
        <div className="col-span-3 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Academic Year</th>
                <th className="px-4 py-3">Elective</th>
              </tr>
            </thead>
            <tbody>
              {gradeAssignments.map((ga) => (
                <tr key={ga.id} className="border-t">
                  <td className="px-4 py-3">{ga.grade_name}</td>
                  <td className="px-4 py-3">
                    {ga.subject_name} ({ga.subject_code})
                  </td>
                  <td className="px-4 py-3">{ga.academic_year_name}</td>
                  <td className="px-4 py-3">{ga.isElective ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* === Assign to Section === */}
      <div className="grid grid-cols-4 gap-2 mb-8">

      <div className=" rounded-lg border bg-white p-4 ">
        <h2 className="mb-4 text-lg font-semibold">
          Assign Subject to Section
        </h2>

        <form
          onSubmit={handleSectionAssignSubmit}
          className="flex flex-col gap-3 "
        >
          <div className="flex-1">
            <label className="mb-1 block font-medium">Section</label>
            <select
              value={sectionAssignForm.sectionId}
              onChange={(e) =>
                setSectionAssignForm((f) => ({
                  ...f,
                  sectionId: e.target.value,
                }))
              }
              className="w-full rounded border p-2"
              required
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.grade.name} - {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-medium">Subject</label>
            <select
              value={sectionAssignForm.subjectId || ""}
              onChange={(e) =>
                setSectionAssignForm((f) => ({
                  ...f,
                  subjectId: Number(e.target.value),
                }))
              }
              className="w-full rounded border p-2"
              required
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-medium">Teacher (optional)</label>
            <select
              value={sectionAssignForm.teacherId}
              onChange={(e) =>
                setSectionAssignForm((f) => ({
                  ...f,
                  teacherId: e.target.value,
                }))
              }
              className="w-full rounded border p-2"
            >
              <option value="">No teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={savingSectionAssign}
            className="rounded cursor-pointer bg-green-600 hover:bg-green-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {savingSectionAssign ? "Assigning..." : "Assign to Section"}
          </button>
        </form>
      </div>

      {sectionAssignments.length > 0 && (
        <div className="col-span-3 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {sectionAssignments.map((sa) => (
                <tr key={sa.id} className="border-t">
                  <td className="px-4 py-3">
                    {sa.grade_name} - {sa.section_name}
                  </td>
                  <td className="px-4 py-3">
                    {sa.subject_name} ({sa.subject_code})
                  </td>
                  <td className="px-4 py-3">
                    {sa.teacher_email || "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </main>
  );
}
