"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CorporatePortalHeader, {
  CorporatePortalSubnav,
} from "@/components/CorporatePortalHeader";
import { Footer } from "@/components/StaticSections";
import {
  corporatePortal,
  getToken,
  BILL_STATUS,
  BILL_TYPE,
  type CompanyBillListItem,
  type CompanyProfile,
} from "@/lib/corporate-portal";
import { loadRazorpay, getRazorpay, type RazorpaySuccess } from "@/lib/razorpay";

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function statusBadge(s: number) {
  const cls =
    s === 2 ? "status-badge status-available" : s === 3 ? "status-badge" : s === 4 ? "status-badge" : "status-badge status-sold-out";
  return <span className={cls}>{BILL_STATUS[s] ?? "—"}</span>;
}

export default function CorporateBillDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [bill, setBill] = useState<CompanyBillListItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paidJustNow, setPaidJustNow] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([
        corporatePortal.bill(id),
        corporatePortal.profile().catch(() => null),
      ]);
      setBill(b);
      setProfile(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this bill.");
      if (!getToken()) router.replace("/portal-corporate/login");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal-corporate/login");
      return;
    }
    load();
  }, [load, router]);

  async function settle(payment: { paymentId: string; orderId: string; signature: string }) {
    await corporatePortal.verifyPayment(id, {
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
      const order = await corporatePortal.checkout(id);

      if (order.keyId) {
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
          prefill: { name: order.companyName, email: order.contactEmail, contact: order.contactMobile ?? "" },
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
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          header, footer, nav, aside, .print\\:hidden, [class*="Header"], [class*="Footer"], [class*="Subnav"] {
            display: none !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      ` }} />
      <CorporatePortalHeader />

      <div className="breadcrumbs-header print:hidden">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-file-invoice-dollar"></i> INVOICE DETAILS
              </span>
              <h1 className="breadcrumbs-title">{bill?.invoiceNumber ?? "Invoice"}</h1>
              <p className="hero-subtitle-text">
                Review payment status, itemized charges, and download official receipt.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CorporatePortalSubnav />
      <div className="portal-section-wrapper" style={{ paddingTop: "32px", paddingBottom: "60px" }}>
        <div className="container max-w-3xl mx-auto">
          <div className="print:hidden mb-6">
            <Link href="/portal-corporate/bills" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all mb-2">
              <i className="fa-solid fa-arrow-left text-xs"></i> Back to all bills
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

              <article id="printable-invoice" className="portal-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)", maxWidth: "840px", margin: "0 auto", backgroundColor: "#ffffff" }}>
                {/* HEADER BANNER */}
                <div style={{ background: "#0c2b5c", color: "#ffffff", padding: "28px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <img src="/images/logo.png" alt="TNIHPL Logo" style={{ height: "40px", objectFit: "contain", marginBottom: "6px" }} />
                    <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 500 }}>Corporate Invoice</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#f7a809", letterSpacing: "0.05em" }}>OFFICIAL INVOICE</div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.9375rem", fontWeight: 700, marginTop: "2px", color: "#ffffff" }}>{bill.invoiceNumber}</div>
                    <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Date: {fmt(bill.billDate)}</div>
                  </div>
                </div>

                <div style={{ padding: "32px" }}>
                  {/* STATUS & DUE DATE */}
                  <div style={{ paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      STATUS &amp; DUE DATE
                    </div>
                    <div style={{ marginBottom: "8px", display: "inline-block" }}>
                      {statusBadge(bill.billStatus)}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#334155" }}>
                      Due: <strong style={{ color: "#0c2b5c" }}>{fmt(bill.dueDate)}</strong>
                    </div>
                  </div>

                  {/* DESCRIPTION & AMOUNT TABLE */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", marginBottom: "24px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ paddingBottom: "12px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>DESCRIPTION</th>
                        <th style={{ paddingBottom: "12px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", textAlign: "right" }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "0.875rem", color: "#1e293b" }}>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ paddingTop: "16px", paddingBottom: "16px", fontWeight: 700, color: "#0c2b5c" }}>
                          {bill.billTitle ?? BILL_TYPE[bill.billType] ?? "Corporate Rent"}
                        </td>
                        <td style={{ paddingTop: "16px", paddingBottom: "16px", textAlign: "right", fontWeight: 700, fontSize: "1rem", color: "#0c2b5c" }}>
                          {inr(bill.billAmount)}
                        </td>
                      </tr>
                      {bill.paidAmount > 0 && (
                        <tr style={{ color: "#2563eb", fontWeight: 600 }}>
                          <td style={{ paddingTop: "12px", paddingBottom: "12px" }}>Paid Amount</td>
                          <td style={{ paddingTop: "12px", paddingBottom: "12px", textAlign: "right" }}>−{inr(bill.paidAmount)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* BALANCE DUE CARD */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", margin: 0 }}>
                    <span style={{ fontWeight: 700, color: "#0c2b5c", fontSize: "1rem" }}>Balance Due</span>
                    <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1252ae" }}>{inr(bill.balance)}</span>
                  </div>

                  {/* AMOUNT IN WORDS */}
                  {bill.amountInWords && (
                    <p style={{ marginTop: "18px", fontSize: "0.8125rem", fontStyle: "italic", color: "#64748b" }}>
                      Amount in words: {bill.amountInWords}
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
