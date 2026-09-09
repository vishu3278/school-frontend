"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

type Grade = { id: string; name: string };
export type AdmissionApplication = {
  id: string;
  applicationNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string | null;
  fatherName: string | null;
  motherName: string | null;
  studentAadharNo: string | null;
  fatherAadharNo: string;
  motherAadharNo: string;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  religion: string | null;
  address: string | null;
  previousSchool: string | null;
  previousGrade: string | null;
  previousResult: string | null;
  academicYear: string;
  status: string;
  birthCertificateReceived: boolean;
  transferCertificateReceived: boolean;
  previousMarksheetReceived: boolean;
  photosReceived: boolean;
  requestedGrade: Grade;
};
const nextStatuses: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "WAITLISTED"],
  WAITLISTED: ["APPROVED", "REJECTED"],
};

function academicYears() {
  const now = new Date();
  const startYear = now.getFullYear() - (now.getMonth() < 3 ? 1 : 0);
  return [-2, -1, 0, 1].map((offset) => {
    const year = startYear + offset;
    return `${year}-${String(year + 1).slice(-2)}`;
  });
}

export default function AdmissionForm({
  grades,
  application,
  canChangeStatus,
  canEdit = true,
}: {
  grades: Grade[];
  application?: AdmissionApplication;
  canChangeStatus: boolean;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const years = academicYears();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() =>
    application
      ? {
          firstName: application.firstName,
          lastName: application.lastName,
          dateOfBirth: application.dateOfBirth,
          gender: application.gender ?? "",
          fatherName: application.fatherName ?? "",
          motherName: application.motherName ?? "",
          phone1: application.phone1 ?? "",
          phone2: application.phone2 ?? "",
          email: application.email ?? "",
          studentAadharNo: application.studentAadharNo ?? "",
          fatherAadharNo: application.fatherAadharNo,
          motherAadharNo: application.motherAadharNo,
          fatherOccupation: application.fatherOccupation ?? "",
          motherOccupation: application.motherOccupation ?? "",
          religion: application.religion ?? "",
          address: application.address ?? "",
          previousSchool: application.previousSchool ?? "",
          previousGrade: application.previousGrade ?? "",
          previousResult: application.previousResult ?? "",
          academicYear: application.academicYear,
          requestedGradeId: application.requestedGrade.id,
          status: application.status,
          birthCertificateReceived: application.birthCertificateReceived,
          transferCertificateReceived: application.transferCertificateReceived,
          previousMarksheetReceived: application.previousMarksheetReceived,
          photosReceived: application.photosReceived,
        }
      : {
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          fatherName: "",
          motherName: "",
          phone1: "",
          phone2: "",
          email: "",
          studentAadharNo: "",
          fatherAadharNo: "",
          motherAadharNo: "",
          fatherOccupation: "",
          motherOccupation: "",
          religion: "",
          address: "",
          previousSchool: "",
          previousGrade: "",
          previousResult: "",
          academicYear: years[2],
          requestedGradeId: "",
          status: "DRAFT",
          birthCertificateReceived: false,
          transferCertificateReceived: false,
          previousMarksheetReceived: false,
          photosReceived: false,
        },
  );

  function change(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    const checked =
      event.target instanceof HTMLInputElement
        ? event.target.checked
        : undefined;
    setForm((current) => ({
      ...current,
      [name]:
        event.target instanceof HTMLInputElement &&
        event.target.type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(application ? `/admissions/${application.id}` : "/admissions", {
        method: application ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      router.push("/admissions");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save application",
      );
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "w-full rounded border border-slate-300 p-2";
  const statusOptions = application
    ? [application.status, ...(nextStatuses[application.status] ?? [])]
    : ["DRAFT"];
  const documentFields = [
    ["birthCertificateReceived", "Birth Certificate"],
    ["transferCertificateReceived", "Transfer Certificate"],
    ["previousMarksheetReceived", "Previous Marksheet"],
    ["photosReceived", "Photos"],
  ] as const;
  return (
    <form onSubmit={submit} className="max-w-4xl space-y-7">
      {error && <p className="rounded bg-red-100 p-3 text-red-700">{error}</p>}
      <fieldset disabled={!canEdit} className="space-y-7 disabled:opacity-60">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Admission Application</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">Application No.</label>
              <input
                readOnly
                value={application?.applicationNo ?? ""}
                placeholder="Auto-generated on save"
                className={`${fieldClass} bg-slate-100`}
              />
            </div>
            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={change}
                disabled={!application || !canChangeStatus}
                className={`${fieldClass} disabled:bg-slate-100`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              {application && nextStatuses[application.status]?.length ? (
                <p className="mt-1 text-xs text-slate-500">
                  Select an available next status and save.
                </p>
              ) : null}
            </label>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Student</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              First Name
              <input
                required
                name="firstName"
                value={form.firstName}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Last Name
              <input
                required
                name="lastName"
                value={form.lastName}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              DOB
              <input
                required
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Gender
              <select
                name="gender"
                value={form.gender}
                onChange={change}
                className={fieldClass}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="md:col-span-2">
              Student Aadhaar
              <input
                name="studentAadharNo"
                value={form.studentAadharNo}
                onChange={change}
                className={fieldClass}
              />
            </label>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Parent / Guardian</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Father
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Mother
              <input
                name="motherName"
                value={form.motherName}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Father&apos;s Aadhaar
              <input
                required
                name="fatherAadharNo"
                value={form.fatherAadharNo}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Mother&apos;s Aadhaar
              <input
                required
                name="motherAadharNo"
                value={form.motherAadharNo}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Father&apos;s Occupation
              <input
                name="fatherOccupation"
                value={form.fatherOccupation}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Mother&apos;s Occupation
              <input
                name="motherOccupation"
                value={form.motherOccupation}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Phone 1
              <input
                name="phone1"
                value={form.phone1}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Phone 2
              <input
                name="phone2"
                value={form.phone2}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label className="md:col-span-2">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                className={fieldClass}
              />
            </label>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Additional Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Religion
              <select
                name="religion"
                value={form.religion}
                onChange={change}
                className={fieldClass}
              >
                <option value="">Select religion</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Sikh">Sikh</option>
                <option value="Christian">Christian</option>
                <option value="Jain">Jain</option>
                <option value="Baudh">Baudh</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="md:col-span-2">
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={change}
                rows={3}
                className={fieldClass}
              />
            </label>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Previous School</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              School
              <input
                name="previousSchool"
                value={form.previousSchool}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label>
              Previous Grade
              <input
                name="previousGrade"
                value={form.previousGrade}
                onChange={change}
                className={fieldClass}
              />
            </label>
            <label className="md:col-span-2">
              Previous Result
              <textarea
                name="previousResult"
                value={form.previousResult}
                onChange={change}
                rows={3}
                className={fieldClass}
              />
            </label>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Requested Admission</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Academic Year
              <select
                required
                name="academicYear"
                value={form.academicYear}
                onChange={change}
                className={fieldClass}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Requested Grade
              <select
                required
                name="requestedGradeId"
                value={form.requestedGradeId}
                onChange={change}
                className={fieldClass}
              >
                <option value="">Select grade</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Documents Received</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {documentFields.map(([name, label]) => (
              <ToggleSwitch
                key={name}
                name={name}
                label={label}
                checked={form[name]}
                checkedLabel="Received"
                uncheckedLabel="Not received"
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, [name]: checked }))
                }
              />
            ))}
          </div>
        </section>
      </fieldset>
      {!canEdit && (
        <p className="rounded bg-amber-50 p-3 text-amber-800">
          {application?.status === "APPROVED" ||
          application?.status === "CANCELLED"
            ? "Approved and cancelled applications are read-only."
            : "This submitted application can only be updated by an administrator."}
        </p>
      )}
      <button
        disabled={saving || !canEdit}
        className="rounded bg-blue-600 px-5 py-2 font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : application ? "Save Changes" : "Save Draft"}
      </button>
    </form>
  );
}
