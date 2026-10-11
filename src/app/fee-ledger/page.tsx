"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Invoice = {
  id: string;
  feeCategoryCode: string;
  amountDue: number;
  paidAmount: number;
  remainingAmount: number;
  billingPeriod: string | null;
  dueDate: string;
  status: string;
  isOverdue: boolean;
  student: { firstName: string; lastName: string; admissionNo: string };
};
type Payment = {
  id: string;
  receiptNo: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: string;
  status: string;
  remarks: string | null;
  voidReason: string | null;
};

export default function FeeLedgerPage() {
  const { hasRole } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    amount: "",
    paymentMode: "cash",
    transactionRef: "",
    remarks: "",
  });
  const load = async () => {
    try {
      setLoading(true);
      setInvoices(await api<Invoice[]>("/fee-ledger/invoices"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load fee ledger");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (hasRole("admin")) void load();
  }, [hasRole]);
  async function selectInvoice(invoice: Invoice) {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    }
  }
  async function collect(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
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
      await load();
      await selectInvoice({ ...selected, remainingAmount: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to collect payment");
    }
  }
  async function voidPayment(id: string) {
    const reason = window.prompt("Reason for voiding this receipt:");
    if (!reason) return;
    try {
      await api(`/fee-ledger/payments/${id}/void`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      if (selected) await selectInvoice(selected);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to void payment");
    }
  }
  if (!hasRole("admin")) return null;
  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fee Ledger</h1>
        <p className="text-slate-600">
          Collect and audit admission and tuition payments.
        </p>
      </div>
      {error && (
        <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}
      {loading ? (
        <p>Loading ledger...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Paid / Remaining</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="cursor-pointer border-t hover:bg-slate-50"
                    onClick={() => void selectInvoice(invoice)}
                  >
                    <td className="p-3">
                      {invoice.student.firstName} {invoice.student.lastName}
                      <div className="text-xs text-slate-500">
                        {invoice.student.admissionNo}
                      </div>
                    </td>
                    <td className="p-3">
                      {invoice.feeCategoryCode}
                      {invoice.billingPeriod
                        ? ` · ${invoice.billingPeriod.slice(0, 7)}`
                        : ""}
                    </td>
                    <td className="p-3">
                      {invoice.dueDate}
                      {invoice.isOverdue && (
                        <div className="text-xs text-red-600">Overdue</div>
                      )}
                    </td>
                    <td className="p-3">
                      ₹{invoice.paidAmount} / ₹{invoice.remainingAmount}
                    </td>
                    <td className="p-3">{invoice.status}</td>
                  </tr>
                ))}
                {!invoices.length && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <aside className="rounded border p-4">
            {selected ? (
              <>
                <h2 className="font-semibold">
                  {selected.student.firstName} {selected.student.lastName}
                </h2>
                <p className="mb-4 text-sm text-slate-600">
                  Outstanding: ₹{selected.remainingAmount}
                </p>
                {selected.status !== "PAID" && (
                  <form onSubmit={collect} className="space-y-3">
                    <input
                      className="w-full rounded border p-2"
                      type="number"
                      min="0.01"
                      max={selected.remainingAmount}
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      required
                    />
                    <select
                      className="w-full rounded border p-2"
                      value={form.paymentMode}
                      onChange={(e) =>
                        setForm({ ...form, paymentMode: e.target.value })
                      }
                    >
                      {["cash", "card", "upi", "bank_transfer", "cheque"].map(
                        (mode) => (
                          <option key={mode}>{mode}</option>
                        ),
                      )}
                    </select>
                    <input
                      className="w-full rounded border p-2"
                      placeholder="Transaction reference"
                      value={form.transactionRef}
                      onChange={(e) =>
                        setForm({ ...form, transactionRef: e.target.value })
                      }
                    />
                    <input
                      className="w-full rounded border p-2"
                      placeholder="Remarks"
                      value={form.remarks}
                      onChange={(e) =>
                        setForm({ ...form, remarks: e.target.value })
                      }
                    />
                    <button className="w-full rounded bg-green-600 p-2 text-white">
                      Collect payment
                    </button>
                  </form>
                )}
                <h3 className="mt-6 font-medium">Receipts</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {payments.map((payment) => (
                    <div key={payment.id} className="rounded bg-slate-50 p-2">
                      <div>
                        {payment.receiptNo} · ₹{payment.amountPaid}
                      </div>
                      <div className="text-slate-500">
                        {payment.paymentDate} · {payment.status}
                      </div>
                      {payment.status === "POSTED" && (
                        <button
                          className="mt-1 text-red-600"
                          onClick={() => void voidPayment(payment.id)}
                        >
                          Void
                        </button>
                      )}
                      {payment.voidReason && (
                        <div className="text-red-600">{payment.voidReason}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-500">
                Select an invoice to collect payment or inspect receipts.
              </p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
