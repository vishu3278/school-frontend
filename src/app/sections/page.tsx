"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import AcademicYearSelect from "@/components/academic-years/AcademicYearSelect";
import { useAcademicYears } from "@/lib/academic-years";

type Grade = {
  id: string;
  name: string;
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

type SectionTeacherAssignment = {
  id: string;
  academicYear: string;
  isClassTeacher: boolean;
  section: Section;
  teacher: User;
};

const emptySectionForm = {
  gradeId: "",
  name: "",
};

const emptyAssignmentForm = {
  sectionId: "",
  teacherId: "",
  academicYear: "",
  isClassTeacher: false,
};

export default function SectionsPage() {
  const { user, hasRole } = useAuth();
  const { currentAcademicYear } = useAcademicYears();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<SectionTeacherAssignment[]>([]);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm);
  const [savingSection, setSavingSection] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [gradesData, sectionsData, usersData, assignmentsData] = await Promise.all([
        api<Grade[]>("/grades"),
        api<Section[]>("/sections"),
        api<User[]>("/users"),
        api<SectionTeacherAssignment[]>("/section-teachers"),
      ]);

      setGrades(gradesData);
      setSections(sectionsData);
      setAssignments(assignmentsData);
      setTeachers(usersData.filter((entry) => entry.role === "teacher"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load section data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user || !hasRole("admin")) {
      return;
    }

    loadData();
  }, [hasRole, user]);

  useEffect(() => {
    if (!assignmentForm.academicYear && currentAcademicYear) {
      setAssignmentForm((current) => ({ ...current, academicYear: currentAcademicYear.name }));
    }
  }, [assignmentForm.academicYear, currentAcademicYear]);

  async function handleCreateSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection(true);
    setError("");

    try {
      const createdSection = await api<Section>("/sections", {
        method: "POST",
        body: JSON.stringify({
          name: sectionForm.name.trim(),
          gradeId: sectionForm.gradeId,
        }),
      });

      setSections((current) => [createdSection, ...current]);
      setSectionForm(emptySectionForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create section");
    } finally {
      setSavingSection(false);
    }
  }

  async function handleDeleteSection(id: string) {
    const confirmed = window.confirm("Delete this section?");

    if (!confirmed) {
      return;
    }

    try {
      await api(`/sections/${id}`, {
        method: "DELETE",
      });

      setSections((current) => current.filter((entry) => entry.id !== id));
      setAssignments((current) => current.filter((entry) => entry.section.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete section");
    }
  }

  async function handleCreateAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAssignment(true);
    setError("");

    try {
      const createdAssignment = await api<SectionTeacherAssignment>("/section-teachers", {
        method: "POST",
        body: JSON.stringify({
          sectionId: assignmentForm.sectionId,
          teacherId: assignmentForm.teacherId,
          academicYear: assignmentForm.academicYear,
          isClassTeacher: assignmentForm.isClassTeacher,
        }),
      });

      setAssignments((current) => [createdAssignment, ...current]);
      setAssignmentForm(emptyAssignmentForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign teacher");
    } finally {
      setSavingAssignment(false);
    }
  }

  if (!user || !hasRole("admin")) {
    return null;
  }

  if (loading) {
    return <main className="p-6">Loading sections...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sections</h1>
          <p className="text-gray-600">Manage grades and teacher assignments</p>
        </div>

        <Link href="/students" className="rounded bg-gray-200 px-4 py-2">
          Back to students
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create section</h2>

          <form onSubmit={handleCreateSection} className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Grade</label>
              <select
                value={sectionForm.gradeId}
                onChange={(event) =>
                  setSectionForm((current) => ({ ...current, gradeId: event.target.value }))
                }
                className="w-full rounded border p-2"
                required
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
              <label className="mb-1 block font-medium">Section name</label>
              <input
                value={sectionForm.name}
                onChange={(event) =>
                  setSectionForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="e.g. A"
                className="w-full rounded border p-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingSection}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {savingSection ? "Creating..." : "Create section"}
            </button>
          </form>
        </div>

        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Assign teacher to section</h2>

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Section</label>
              <select
                value={assignmentForm.sectionId}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    sectionId: event.target.value,
                  }))
                }
                className="w-full rounded border p-2"
                required
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.grade.name} - {section.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">Teacher</label>
              <select
                value={assignmentForm.teacherId}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    teacherId: event.target.value,
                  }))
                }
                className="w-full rounded border p-2"
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">Academic year</label>
              <AcademicYearSelect
                value={assignmentForm.academicYear}
                onChange={(academicYear) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    academicYear,
                  }))
                }
                required
              />
            </div>

            <ToggleSwitch
              name="isClassTeacher"
              label="Class teacher"
              checked={assignmentForm.isClassTeacher}
              checkedLabel="Yes"
              uncheckedLabel="No"
              onCheckedChange={(isClassTeacher) =>
                setAssignmentForm((current) => ({
                  ...current,
                  isClassTeacher,
                }))
              }
            />

            <button
              type="submit"
              disabled={savingAssignment}
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {savingAssignment ? "Assigning..." : "Assign teacher"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Academic year</th>
              <th className="px-4 py-3">Class teacher</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No sections found.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id} className="border-t">
                  <td className="px-4 py-3">{section.grade.name}</td>
                  <td className="px-4 py-3">{section.name}</td>
                  <td className="px-4 py-3">
                    {assignments
                      .filter((assignment) => assignment.section.id === section.id)
                      .map((assignment) => (
                        <div key={assignment.id}>
                          {assignment.teacher.firstName} {assignment.teacher.lastName}
                        </div>
                      )) || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {assignments
                      .filter((assignment) => assignment.section.id === section.id)
                      .map((assignment) => (
                        <div key={assignment.id}>{assignment.academicYear}</div>
                      )) || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {assignments.some(
                      (assignment) =>
                        assignment.section.id === section.id && assignment.isClassTeacher,
                    )
                      ? "Yes"
                      : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600"
                    >
                      Delete
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
