"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { api } from "@/lib/api";

type Grade = {
  id: string;
  name: string;
};

type StudentFormValues = {
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  password: string;
  motherName: string;
  fatherName: string;
  aadharNo: string;
  religion: string;
  gradeId: string;
};

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState<StudentFormValues>({
    admissionNo: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    phone2: "",
    email: "",
    address: "",
    password: "",
    motherName: "",
    fatherName: "",
    aadharNo: "",
    religion: "",
    gradeId: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const [studentData, gradesData] = await Promise.all([
          api<{ id: string; admissionNo: string; firstName: string; lastName: string; dateOfBirth?: string | null; gender?: string | null; phone?: string | null; phone2?: string | null; email?: string | null; address?: string | null; password?: string | null; motherName?: string | null; fatherName?: string | null; aadharNo?: string | null; religion?: string | null; grade: Grade }>(`/students/${id}`),
          api<Grade[]>("/grades"),
        ]);

        setGrades(gradesData);
        setForm({
          admissionNo: studentData.admissionNo,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth ?? "",
          gender: studentData.gender ?? "",
          phone: studentData.phone ?? "",
          phone2: studentData.phone2 ?? "",
          email: studentData.email ?? "",
          address: studentData.address ?? "",
          password: studentData.password ?? "",
          motherName: studentData.motherName ?? "",
          fatherName: studentData.fatherName ?? "",
          aadharNo: studentData.aadharNo ?? "",
          religion: studentData.religion ?? "",
          gradeId: studentData.grade?.id ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load student",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      return;
    }

    setError("");
    setSaving(true);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined,
        ),
      );

      await api(`/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      router.push("/students");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update student",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-6">Loading student...</main>;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Student</h1>
          <p className="text-gray-600">Update student details</p>
        </div>

        <Link href="/students" className="rounded bg-gray-200 px-4 py-2">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">Admission Number</label>
            <input
              name="admissionNo"
              value={form.admissionNo}
              readOnly
              className="w-full rounded border bg-gray-50 p-2 text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Grade</label>
            <select
              name="gradeId"
              value={form.gradeId}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">First Name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Last Name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Phone 2</label>
            <input
              name="phone2"
              value={form.phone2}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Mother's Name</label>
            <input
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Father's Name</label>
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Aadhar Number</label>
            <input
              name="aadharNo"
              value={form.aadharNo}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Religion</label>
            <select
              name="religion"
              value={form.religion}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              <option value="">Select Religion</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Sikh">Sikh</option>
              <option value="Christian">Christian</option>
              <option value="Jain">Jain</option>
              <option value="Baudh">Baudh</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-medium">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={4}
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
