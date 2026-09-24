"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

type Grade = {
  id: string;
  name: string;
};

type Section = {
  id: string;
  name: string;
};

export type Student = {
  id: string;
  admissionNo: string;
  rollNo?: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  grade: Grade;
  section: Section;
  isActive: boolean;
};

type StudentTableProps = {
  students: Student[];
  onDelete: (id: string) => void;
};

export default function StudentTable({
  students,
  onDelete,
}: StudentTableProps) {
  const { hasRole } = useAuth();
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3">Admission No.</th>

            <th className="px-4 py-3">Roll No.</th>

            <th className="px-4 py-3">Name</th>

            <th className="px-4 py-3">Grade</th>

            <th className="px-4 py-3">Section</th>

            <th className="px-4 py-3">Phone</th>

            <th className="px-4 py-3">Status</th>

            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-t">
              <td className="px-4 py-3">{student.admissionNo}</td>

              <td className="px-4 py-3">{student.rollNo || "-"}</td>

              <td className="px-4 py-3">
                {student.firstName} {student.lastName}
              </td>

              <td className="px-4 py-3">{student.grade.name}</td>

              <td className="px-4 py-3">{student.section?.name || "-"}</td>

              <td className="px-4 py-3">{student.phone || "-"}</td>

              <td className="px-4 py-3">{student.isActive ? "Active" : "Inactive"}</td>

              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-blue-600"
                  >
                    View
                  </Link>
                  {hasRole("admin") && (
                    <>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className="text-green-600"
                        >
                        Edit
                      </Link>

                      <button
                      onClick={() => onDelete(student.id)}
                      className="text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
