"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PortalHeader, { PortalSubnav } from "@/components/PortalHeader";
import { Footer } from "@/components/StaticSections";
import { resident, getToken, BILL_STATUS, BILL_TYPE, type ResidentBill } from "@/lib/resident";
import { loadRazorpay, getRazorpay, type RazorpaySuccess } from "@/lib/razorpay";

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function statusBadge(s: number) {
  const cls = s === 2 ? "status-badge status-available" : s === 3 ? "status-badge" : s === 4 ? "status-badge" : "status-badge status-sold-out";
  return <span className={cls}>{BILL_STATUS[s] ?? "—"}</span>;
}

export default function BillDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [bill, setBill] = useState<ResidentBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paidJustNow, setPaidJustNow] = useState(false);

  const load = useCallback(async () => {
    try {
      setBill(await resident.bill(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this bill.");
      if (!getToken()) router.replace("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal/login");
      return;
    }
    load();
  }, [load, router]);

  async function settle(payment: { paymentId: string; orderId: string; signature: string }) {
    await resident.verifyPayment(id, {
      razorpayPaymentId: payment.paymentId,
      razorpayOrderId: payment.orderId,
      razorpaySignature: payment.signature,
    });
    await load();
    setPaidJustNow(true);
    setPaying(false);
  }

  async function payNow() {
    setPaying(true);
    setPayError("");
    try {
      const order = await resident.checkout(id);

      if (order.keyId) {
        // Real Razorpay Checkout popup
        const ok = await loadRazorpay();
        const Razorpay = getRazorpay();
        if (!ok || !Razorpay) throw new Error("Could not load the secure payment window. Check your connection.");
        const rzp = new Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amountPaise,
          currency: order.currency,
          name: "TNIHPL Residences",
          description: order.billTitle ?? `Invoice ${order.invoiceNumber}`,
          prefill: { name: order.residentName, email: order.residentEmail, contact: order.residentMobile ?? "" },
          theme: { color: "#1252AE" },
          handler: async (resp: RazorpaySuccess) => {
            try {
              await settle({ paymentId: resp.razorpay_payment_id, orderId: resp.razorpay_order_id, signature: resp.razorpay_signature });
            } catch (e) {
              setPayError(e instanceof Error ? e.message : "We couldn't confirm your payment.");
              setPaying(false);
            }
          },
          modal: { ondismiss: () => setPaying(false) },
        });
        rzp.on("payment.failed", () => {
          setPayError("Payment failed or was cancelled. Please try again.");
          setPaying(false);
        });
        rzp.open();
      } else {
        // Sandbox demo (no Razorpay keys configured yet)
        await settle({ paymentId: `demo_${Date.now()}`, orderId: order.orderId, signature: "demo" });
      }
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Could not start the payment.");
      setPaying(false);
    }
  }

  const payable = bill && bill.billStatus !== 2 && bill.billStatus !== 4 && bill.balance > 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <PortalHeader />
      <PortalSubnav />
      <div className="portal-section-wrapper">
        <div className="container max-w-3xl mx-auto">
          <div className="print:hidden mb-4">
            <Link href="/portal/bills" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600">
              <i className="fa-solid fa-arrow-left"></i> Back to all bills
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-blue-600 mb-2 block"></i>
              Loading invoice details…
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          ) : bill ? (
            <>
              {paidJustNow && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-3 print:hidden">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-xl"></i>
                  Payment successful! Your invoice balance has been settled.
                </div>
              )}

              <article className="portal-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                <div style={{ padding: "24px", background: "var(--secondary-color)", color: "#ffffff", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
                      TNIHPL<span style={{ color: "var(--accent-color)" }}>.</span>
                    </div>
                    <p style={{ fontSize: "var(--font-xs)", color: "rgba(255,255,255,0.7)", margin: 0 }}>{bill.hostelName ?? "TNIHPL Hostels"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--accent-color)", letterSpacing: "0.05em" }}>OFFICIAL INVOICE</div>
                    <div style={{ fontFamily: "monospace", fontSize: "var(--font-sm)", fontWeight: 700, marginTop: "2px" }}>{bill.invoiceNumber}</div>
                    <div style={{ fontSize: "var(--font-xs)", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>Date: {fmt(bill.billDate)}</div>
                  </div>
                </div>

                <div style={{ padding: "32px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-color-light)" }}>
                    <div>
                      <div style={{ fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>Billed To</div>
                      <div style={{ fontWeight: 700, color: "var(--secondary-color)", fontSize: "var(--font-md)" }}>{bill.residentName}</div>
                      <div style={{ color: "var(--text-body)", fontSize: "var(--font-sm)", marginTop: "4px" }}>{bill.residentEmail}</div>
                      {bill.residentMobile && <div style={{ color: "var(--text-body)", fontSize: "var(--font-sm)", marginTop: "2px" }}>{bill.residentMobile}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>Status &amp; Due Date</div>
                      <div style={{ marginBottom: "8px", display: "inline-block" }}>{statusBadge(bill.billStatus)}</div>
                      <div style={{ fontSize: "var(--font-xs)", color: "var(--text-body)" }}>Due: <strong style={{ color: "var(--secondary-color)" }}>{fmt(bill.dueDate)}</strong></div>
                    </div>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", marginBottom: "24px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border-color-light)", textAlign: "left" }}>
                        <th style={{ paddingBottom: "12px", fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Description</th>
                        <th style={{ paddingBottom: "12px", fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "var(--font-sm)", color: "var(--text-body)" }}>
                      <tr style={{ borderBottom: "1px solid var(--border-color-light)" }}>
                        <td style={{ paddingTop: "12px", paddingBottom: "12px", fontWeight: 600, color: "var(--secondary-color)" }}>
                          {bill.billTitle ?? BILL_TYPE[bill.billType] ?? "Hostel Fee"}
                          {bill.billDescription && <div style={{ fontSize: "var(--font-xs)", fontWeight: 400, color: "var(--text-muted)", marginTop: "4px" }}>{bill.billDescription}</div>}
                        </td>
                        <td style={{ paddingTop: "12px", paddingBottom: "12px", textAlign: "right", fontWeight: 600, color: "var(--secondary-color)" }}>{inr(bill.deposit + bill.rent)}</td>
                      </tr>
                      {!bill.isGstExempted && bill.gstAmount > 0 && (
                        <tr style={{ borderBottom: "1px solid var(--border-color-light)" }}>
                          <td style={{ paddingTop: "12px", paddingBottom: "12px", color: "var(--text-body)" }}>GST</td>
                          <td style={{ paddingTop: "12px", paddingBottom: "12px", textAlign: "right", fontWeight: 600, color: "var(--secondary-color)" }}>{inr(bill.gstAmount)}</td>
                        </tr>
                      )}
                      <tr style={{ fontWeight: 700, color: "var(--secondary-color)" }}>
                        <td style={{ paddingTop: "16px", paddingBottom: "8px" }}>Total Amount</td>
                        <td style={{ paddingTop: "16px", paddingBottom: "8px", textAlign: "right", fontSize: "var(--font-md)" }}>{inr(bill.billAmount)}</td>
                      </tr>
                      {bill.paidAmount > 0 && (
                        <tr style={{ color: "var(--color-available)", fontWeight: 600 }}>
                          <td style={{ paddingTop: "8px", paddingBottom: "8px" }}>Paid Amount</td>
                          <td style={{ paddingTop: "8px", paddingBottom: "8px", textAlign: "right" }}>−{inr(bill.paidAmount)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="portal-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)", margin: 0 }}>
                    <span style={{ fontWeight: 700, color: "var(--secondary-color)" }}>Balance Due</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-color)" }}>{inr(bill.balance)}</span>
                  </div>

                  {bill.billAmountInWords && (
                    <p style={{ marginTop: "16px", fontSize: "var(--font-xs)", fontStyle: "italic", color: "var(--text-muted)" }}>Amount in words: {bill.billAmountInWords}</p>
                  )}
                  {bill.paidAmount > 0 && (bill.modeOfPayment || bill.txnId) && (
                    <p style={{ marginTop: "8px", fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
                      Payment{bill.modeOfPayment ? ` via ${bill.modeOfPayment}` : ""}{bill.txnId ? ` · Txn ${bill.txnId}` : ""}{bill.receiptDate ? ` · ${fmt(bill.receiptDate)}` : ""}
                    </p>
                  )}
                </div>
              </article>

              <div className="print:hidden" style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                {payable && (
                  <button onClick={payNow} disabled={paying} className="btn-portal-submit" style={{ margin: 0 }}>
                    <i className="fa-solid fa-credit-card mr-2"></i>
                    {paying ? "Processing Payment…" : `Pay ${inr(bill.balance)} Online`}
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="btn-portal-submit"
                  style={{ margin: 0, background: "transparent", color: "var(--secondary-color)", border: "1px solid var(--border-color)" }}
                >
                  <i className="fa-solid fa-print mr-2"></i> Print / Save PDF
                </button>
                {payable && (
                  <span style={{ marginLeft: "auto", fontSize: "var(--font-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className="fa-solid fa-lock text-emerald-600"></i> Encrypted 256-bit Razorpay Gateway
                  </span>
                )}
              </div>
              {payError && (
                <div style={{ marginTop: "16px", padding: "12px", background: "var(--danger-soft)", border: "1px solid var(--danger-color)", borderRadius: "var(--radius-sm)", color: "var(--danger-color)", fontSize: "var(--font-xs)" }} className="print:hidden">
                  {payError}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <Footer />
    </main>
  );
}
