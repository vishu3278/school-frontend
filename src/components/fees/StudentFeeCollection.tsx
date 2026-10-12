"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";

type Invoice = {
  id: string;
  feeCategoryCode: string;
  feeCategoryName?: string;
  amountDue: number;
  paidAmount: number;
  remainingAmount: number;
  billingPeriod: string | null;
  dueDate: string;
  status: string;
  isOverdue: boolean;
};
type Payment = {
  id: string;
  receiptNo: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: string;
  status: string;
  voidReason: string | null;
};
type AcademicYear = { id: number; name: string; isCurrent: boolean };
type OtherFeeStructure = {
  id: number;
  categoryName: string;
  amount: number;
  frequency: string;
  dueDate: string | null;
};

export default function StudentFeeCollection({
  studentId,
}: {
  studentId: string;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [academicYearId, setAcademicYearId] = useState("");
  const [otherStructures, setOtherStructures] = useState<OtherFeeStructure[]>([]);
  const [otherStructureId, setOtherStructureId] = useState("");
  const [otherDueDate, setOtherDueDate] = useState("");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creatingOtherInvoice, setCreatingOtherInvoice] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    paymentMode: "cash",
    transactionRef: "",
    remarks: "",
  });

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await api<Invoice[]>(
        `/fee-ledger/invoices?studentId=${studentId}`,
      );
      setInvoices(data);
      setSelected(
        (current) => data.find((invoice) => invoice.id === current?.id) ?? null,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load student fees",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const years = await api<AcademicYear[]>("/academic-years");
        setAcademicYears(years);
        setAcademicYearId(
          String(
            years.find((year) => year.isCurrent)?.id ?? years[0]?.id ?? "",
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load academic years",
        );
      }
      await loadInvoices();
    }
    void loadData();
  }, [studentId]);

  async function generateInvoices() {
    if (!academicYearId) return;
    setGenerating(true);
    setError("");
    try {
      await api(`/fee-ledger/students/${studentId}/invoices`, {
        method: "POST",
        body: JSON.stringify({ academicYearId: Number(academicYearId) }),
      });
      await loadInvoices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate fee invoices",
      );
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    async function loadOtherStructures() {
      if (!academicYearId) return;
      try {
        const structures = await api<OtherFeeStructure[]>(
          `/fee-ledger/students/${studentId}/other-fee-structures?academicYearId=${academicYearId}`,
        );
        setOtherStructures(structures);
        setOtherStructureId(String(structures[0]?.id ?? ""));
        setOtherDueDate(structures[0]?.dueDate ?? "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load other fee options",
        );
      }
    }
    void loadOtherStructures();
  }, [academicYearId, studentId]);

  async function createOtherInvoice() {
    if (!otherStructureId) return;
    setCreatingOtherInvoice(true);
    setError("");
    try {
      await api(`/fee-ledger/students/${studentId}/other-invoices`, {
        method: "POST",
        body: JSON.stringify({
          feeStructureId: Number(otherStructureId),
          dueDate: otherDueDate || undefined,
        }),
      });
      await loadInvoices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create other fee invoice",
      );
    } finally {
      setCreatingOtherInvoice(false);
    }
  }

  async function chooseInvoice(invoice: Invoice) {
    setSelected(invoice);
    setForm({
      amount: String(invoice.remainingAmount),
      paymentMode: "cash",
      transactionRef: "",
      remarks: "",
    });
    try {
      setPayments(
        await api<Payment[]>(`/fee-ledger/invoices/${invoice.id}/payments`),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load payment history",
      );
    }
  }

  async function collect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await api("/fee-ledger/payments", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: selected.id,
          amount: Number(form.amount),
          paymentMode: form.paymentMode,
          transactionRef: form.transactionRef || undefined,
          remarks: form.remarks || undefined,
        }),
      });
      await loadInvoices();
      const refreshed = await api<Invoice[]>(
        `/fee-ledger/invoices?studentId=${studentId}`,
      );
      const current = refreshed.find((invoice) => invoice.id === selected.id);
      if (current) await chooseInvoice(current);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to collect payment",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading fee invoices...</p>;
  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="text-xl font-bold">Fee Collection</h2>
      <p className="mb-4 text-slate-600">
        Choose an invoice, enter any amount up to the outstanding balance, then
        collect the receipt.
      </p>
      {error && (
        <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded border border-blue-100 bg-blue-50 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Academic year
          </label>
          <select
            value={academicYearId}
            onChange={(event) => setAcademicYearId(event.target.value)}
            className="rounded border bg-white p-2"
          >
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
                {year.isCurrent ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!academicYearId || generating}
          onClick={() => void generateInvoices()}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {generating
            ? "Generating..."
            : "Generate admission & tuition invoices"}
        </button>
        <p className="max-w-xl text-sm text-slate-600">
          Use this for existing students. It creates only missing invoices, so
          it is safe to run again.
        </p>
        <Link
          href="/fees"
          className="text-sm font-medium text-blue-700 underline"
        >
          Configure fee structures
        </Link>
      </div>
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded border p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Other fee</label>
          <select
            value={otherStructureId}
            onChange={(event) => {
              const structure = otherStructures.find(
                (item) => item.id === Number(event.target.value),
              );
              setOtherStructureId(event.target.value);
              setOtherDueDate(structure?.dueDate ?? "");
            }}
            className="rounded border p-2"
            disabled={!otherStructures.length}
          >
            {!otherStructures.length && <option>No other fee structures</option>}
            {otherStructures.map((structure) => (
              <option key={structure.id} value={structure.id}>
                {structure.categoryName} — ₹{structure.amount}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Due date</label>
          <input
            type="date"
            value={otherDueDate}
            onChange={(event) => setOtherDueDate(event.target.value)}
            className="rounded border p-2"
          />
        </div>
        <button
          type="button"
          disabled={!otherStructureId || creatingOtherInvoice}
          onClick={() => void createOtherInvoice()}
          className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {creatingOtherInvoice ? "Creating..." : "Create other fee invoice"}
        </button>
        <p className="max-w-xl text-sm text-slate-600">
          Create an Examination, I-card, or other configured fee invoice for
          this student.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Fee</th>
                <th className="p-3">Due</th>
                <th className="p-3">Billed</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => void chooseInvoice(invoice)}
                  className="cursor-pointer border-t hover:bg-slate-50"
                >
                  <td className="p-3">
                    {invoice.feeCategoryName ?? invoice.feeCategoryCode}
                    {invoice.billingPeriod
                      ? ` · ${invoice.billingPeriod.slice(0, 7)}`
                      : ""}
                  </td>
                  <td className="p-3">
                    {invoice.dueDate}
                    {invoice.isOverdue && (
                      <span className="ml-1 text-red-600">Overdue</span>
                    )}
                  </td>
                  <td className="p-3">₹{invoice.amountDue}</td>
                  <td className="p-3">₹{invoice.paidAmount}</td>
                  <td className="p-3 font-medium">
                    ₹{invoice.remainingAmount}
                  </td>
                  <td className="p-3">{invoice.status}</td>
                </tr>
              ))}
              {!invoices.length && (
                <tr>
                  <td colSpan={6} className="p-5 text-center text-slate-500">
                    No fee invoices exist for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <aside className="rounded border p-4">
          {selected ? (
            <>
              <h3 className="font-semibold">
                Collect {selected.feeCategoryCode} payment
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Outstanding balance: ₹{selected.remainingAmount}
              </p>
              {selected.status !== "PAID" && (
                <form onSubmit={collect} className="space-y-3">
                  <label className="block text-sm font-medium">
                    Amount to collect
                  </label>
                  <input
                    className="w-full rounded border p-2"
                    type="number"
                    min="0.01"
                    max={selected.remainingAmount}
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    required
                  />
                  <select
                    className="w-full rounded border p-2"
                    value={form.paymentMode}
                    onChange={(event) =>
                      setForm({ ...form, paymentMode: event.target.value })
                    }
                  >
                    {["cash", "card", "upi", "bank_transfer", "cheque"].map(
                      (mode) => (
                        <option key={mode} value={mode}>
                          {mode.replace("_", " ")}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    className="w-full rounded border p-2"
                    placeholder="Transaction reference (optional)"
                    value={form.transactionRef}
                    onChange={(event) =>
                      setForm({ ...form, transactionRef: event.target.value })
                    }
                  />
                  <input
                    className="w-full rounded border p-2"
                    placeholder="Remarks (optional)"
                    value={form.remarks}
                    onChange={(event) =>
                      setForm({ ...form, remarks: event.target.value })
                    }
                  />
                  <button
                    disabled={saving}
                    className="w-full rounded bg-green-600 p-2 text-white disabled:opacity-50"
                  >
                    {saving ? "Collecting..." : "Collect payment"}
                  </button>
                </form>
              )}
              <h4 className="mt-6 font-medium">Receipts</h4>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="mt-2 rounded bg-slate-50 p-2 text-sm"
                >
                  <div>
                    {payment.receiptNo} · ₹{payment.amountPaid}
                  </div>
                  <div className="text-slate-500">
                    {payment.paymentDate} · {payment.status}
                  </div>
                  {payment.voidReason && (
                    <div className="text-red-600">{payment.voidReason}</div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p className="text-slate-500">
              Select an invoice to collect a payment.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
