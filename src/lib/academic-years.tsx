"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export type AcademicYear = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type AcademicYearsContextValue = {
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear | undefined;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  replace: (academicYear: AcademicYear) => void;
};

const AcademicYearsContext = createContext<AcademicYearsContextValue | undefined>(undefined);

export function AcademicYearsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setAcademicYears([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      setAcademicYears(await api<AcademicYear[]>("/academic-years"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load academic years");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { void refresh(); }, [refresh]);

  const replace = useCallback((academicYear: AcademicYear) => {
    setAcademicYears((current) => {
      const exists = current.some((entry) => entry.id === academicYear.id);
      const next = exists
        ? current.map((entry) => entry.id === academicYear.id ? academicYear : academicYear.isCurrent ? { ...entry, isCurrent: false } : entry)
        : [academicYear, ...current.map((entry) => academicYear.isCurrent ? { ...entry, isCurrent: false } : entry)];
      return [...next].sort((a, b) => b.startDate.localeCompare(a.startDate));
    });
  }, []);

  const value = useMemo(() => ({
    academicYears,
    currentAcademicYear: academicYears.find((academicYear) => academicYear.isCurrent),
    loading,
    error,
    refresh,
    replace,
  }), [academicYears, error, loading, refresh, replace]);

  return <AcademicYearsContext.Provider value={value}>{children}</AcademicYearsContext.Provider>;
}

export function useAcademicYears() {
  const context = useContext(AcademicYearsContext);
  if (!context) throw new Error("useAcademicYears must be used within an AcademicYearsProvider");
  return context;
}
