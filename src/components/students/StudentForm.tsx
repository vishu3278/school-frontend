"use client";

import { FormEvent, useState } from "react";

type Grade = {
  id: string;
  name: string;
};

type StudentFormProps = {
  grades: Grade[];
};

export default function StudentForm({ grades }: StudentFormProps) {
  const [form, setForm] = useState({
    admissionNo: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    gradeId: "",
  });

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

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
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        gradeId: "",
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
            onChange={handleChange}
            required
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
          <label className="mb-1 block font-medium">Phone</label>

          <input
            name="phone"
            value={form.phone}
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
