"use client";

import { useAcademicYears } from "@/lib/academic-years";

export default function AcademicYearSelect({ value, onChange, required = false, disabled = false }: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  const { academicYears, loading } = useAcademicYears();

  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} required={required} disabled={disabled || loading} className="w-full rounded border border-slate-300 p-2 disabled:bg-slate-100">
      <option value="">{loading ? "Loading academic years..." : "Select academic year"}</option>
      {academicYears.map((academicYear) => (
        <option key={academicYear.id} value={academicYear.name}>
          {academicYear.name}{academicYear.isCurrent ? " (Current)" : ""}
        </option>
      ))}
    </select>
  );
}
