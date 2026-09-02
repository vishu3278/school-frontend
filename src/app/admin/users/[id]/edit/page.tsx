"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { api } from "@/lib/api";

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  highestEducation: string;
  institution: string;
  yearOfPassing: string;
  address: string;
  maritalStatus: string;
  gender: string;
  photo: string;
};

const emptyForm: UserForm = {
  firstName: "", lastName: "", email: "", password: "", role: "student",
  phone: "", highestEducation: "", institution: "", yearOfPassing: "",
  address: "", maritalStatus: "", gender: "", photo: "",
};

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api<UserForm>(`/users/${id}`)
      .then((data) => setForm({
        firstName: data.firstName ?? "", lastName: data.lastName ?? "", email: data.email ?? "",
        password: "", role: data.role ?? "student", phone: data.phone ?? "",
        highestEducation: data.highestEducation ?? "", institution: data.institution ?? "",
        yearOfPassing: data.yearOfPassing ?? "", address: data.address ?? "",
        maritalStatus: data.maritalStatus ?? "", gender: data.gender ?? "", photo: data.photo ?? "",
      }))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = Object.fromEntries(
      Object.entries(form).filter(([key, value]) => key !== "password" || value.trim() !== ""),
    );

    try {
      await api(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      router.push(`/admin/users/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="p-6">Loading user...</main>;

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Edit user</h1><p className="text-gray-600">Update user information</p></div>
        <Link href={`/admin/users/${id}`} className="rounded bg-gray-200 px-4 py-2">Cancel</Link>
      </div>
      {error && <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="grid max-w-4xl gap-4 md:grid-cols-2">
        {(["firstName", "lastName", "email", "phone", "highestEducation", "institution", "yearOfPassing", "maritalStatus", "gender", "photo"] as const).map((name) => (
          <div key={name}>
            <label className="mb-1 block font-medium">{name === "firstName" ? "First name" : name === "lastName" ? "Last name" : name === "highestEducation" ? "Highest education" : name === "yearOfPassing" ? "Year of passing" : name === "maritalStatus" ? "Marital status" : name === "institution" ? "Institution / university / board / school" : name === "photo" ? "Photo URL" : name[0].toUpperCase() + name.slice(1)}</label>
            {name === "gender" ? (
              <select name={name} value={form[name]} onChange={handleChange} className="w-full rounded border p-2">
                <option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            ) : name === "maritalStatus" ? (
              <select name={name} value={form[name]} onChange={handleChange} className="w-full rounded border p-2">
                <option value="">Select marital status</option><option value="Never Married">Never Married</option><option value="Currently Married">Currently Married</option><option value="Widow / Widower">Widow / Widower</option><option value="Divorced">Divorced</option><option value="Separated">Separated</option>
              </select>
            ) : (
              <input name={name} type={name === "email" ? "email" : name === "photo" ? "url" : "text"} value={form[name]} onChange={handleChange} className="w-full rounded border p-2" required={name === "firstName" || name === "lastName" || name === "email"} pattern={name === "phone" ? "\\d{10}" : name === "yearOfPassing" ? "(?:19|20)\\d{2}" : undefined} title={name === "phone" ? "Enter exactly 10 digits" : name === "yearOfPassing" ? "Enter a 4-digit year starting with 19 or 20" : undefined} />
            )}
          </div>
        ))}
        <div>
          <label className="mb-1 block font-medium">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full rounded border p-2">
            <option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option><option value="staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block font-medium">New password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded border p-2" placeholder="Leave blank to keep current" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-medium">Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="w-full rounded border p-2" rows={3} />
        </div>
        <div className="md:col-span-2"><button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button></div>
      </form>
    </main>
  );
}
