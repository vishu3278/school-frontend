"use client";

import { FormEvent, useEffect, useState } from "react";

import { api } from "@/lib/api";

type Grade = {
  id: string;
  name: string;
};

type Section = {
  id: string;
  name: string;
  grade: Grade;
};

type StudentFormProps = {
  grades: Grade[];
};

export default function StudentForm({ grades }: StudentFormProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [form, setForm] = useState({
    admissionNo: "",
    rollNo: "",
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
    sectionId: "",
  });

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSections() {
      if (!form.gradeId) {
        setSections([]);
        setForm((current) => ({ ...current, sectionId: "" }));
        return;
      }

      try {
        const sectionsData = await api<Section[]>(`/sections?gradeId=${form.gradeId}`);
        setSections(sectionsData);
        setForm((current) => ({
          ...current,
          sectionId:
            current.sectionId &&
            sectionsData.some((section) => section.id === current.sectionId)
              ? current.sectionId
              : "",
        }));
      } catch {
        setSections([]);
      }
    }

    loadSections();
  }, [form.gradeId]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined,
        ),
      );

      const response = await fetch("http://localhost:3001/students", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message || "Unable to create student");
      }

      const student = await response.json();

      console.log("Created student:", student);

      alert("Student added successfully!");

      // Reset form
      setForm({
        admissionNo: "",
        rollNo: "",
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
        sectionId: "",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium">Admission Number</label>

          <input
            name="admissionNo"
            value={form.admissionNo}
            readOnly
            placeholder="Auto-generated on save"
            className="w-full rounded border bg-gray-50 p-2 text-gray-700"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Roll Number</label>

          <input
            name="rollNo"
            value={form.rollNo}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />
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
          <label className="mb-1 block font-medium">Section</label>

          <select
            name="sectionId"
            value={form.sectionId}
            onChange={handleChange}
            required
            disabled={!form.gradeId || sections.length === 0}
            className="w-full rounded border p-2 disabled:bg-gray-100"
          >
            <option value="">
              {form.gradeId ? "Select Section" : "Select Grade first"}
            </option>

            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
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
            placeholder="Leave blank for default"
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

      <div className="grid gap-4 md:grid-cols-2">
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

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add Student"}
      </button>
    </form>
  );
}
