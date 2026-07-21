"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "@/lib/corporate-portal";

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function statusBadge(s: number) {
  const cls =
    s === 2 ? "status-badge status-available" : s === 3 ? "status-badge" : s === 4 ? "status-badge" : "status-badge status-sold-out";
  return <span className={cls}>{BILL_STATUS[s] ?? "—"}</span>;
}

export default function CorporateBillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<CompanyBillListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal-corporate/login");
      return;
    }
    (async () => {
      try {
        setBills(await corporatePortal.bills());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your bills.");
        if (!getToken()) router.replace("/portal-corporate/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const outstanding = bills
    .filter((b) => b.billStatus !== 2 && b.billStatus !== 4)
    .reduce((sum, b) => sum + b.balance, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <CorporatePortalHeader />

      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-file-invoice-dollar"></i> INVOICES &amp; PAYMENTS
              </span>
              <h1 className="breadcrumbs-title">Bills &amp; Payments</h1>
              <p className="hero-subtitle-text">
                Track your company&apos;s monthly rent invoices and payment
                history.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CorporatePortalSubnav />

      <div className="portal-section-wrapper">
        <div className="container max-w-4xl mx-auto">
          {loading ? (
            <div className="portal-card text-center" style={{ padding: "40px 24px" }}>
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
              Loading billing details…
            </div>
          ) : error ? (
            <div className="portal-card" style={{ borderLeft: "4px solid var(--danger-color)", color: "var(--danger-color)" }}>
              {error}
            </div>
          ) : (
            <>
              {outstanding > 0 && (
                <div
                  className="portal-card"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    background: "var(--accent-soft)",
                    borderColor: "rgba(247, 168, 9, 0.35)",
                    padding: "24px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--accent-color)", marginBottom: "4px", letterSpacing: "0.05em" }}>
                      Total Outstanding Balance
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--secondary-color)" }}>{inr(outstanding)}</div>
                  </div>
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--secondary-color)", fontWeight: 500 }}>
                    <i className="fa-solid fa-circle-info mr-1" style={{ color: "var(--accent-color)" }}></i> Select an invoice below to pay online via Razorpay.
                  </span>
                </div>
              )}

              <div className="portal-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", background: "var(--secondary-color)", color: "#ffffff", fontWeight: 700, fontSize: "var(--font-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Invoices ({bills.length})</span>
                  <i className="fa-solid fa-receipt" style={{ color: "var(--accent-color)" }}></i>
                </div>

                {bills.length === 0 ? (
                  <p className="portal-empty-msg" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <i className="fa-regular fa-file-lines mr-1"></i> No bills generated for your account yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {bills.map((b) => (
                      <Link
                        key={b.id}
                        href={`/portal-corporate/bills/${b.id}`}
                        style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "16px", padding: "18px 24px", borderBottom: "1px solid var(--border-color-light)", textDecoration: "none", color: "inherit", transition: "background 0.2s" }}
                        className="hover:bg-slate-50"
                      >
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--primary-soft)", color: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 }}>
                          ₹
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "var(--secondary-color)", fontSize: "var(--font-sm)" }}>
                            {b.billTitle ?? BILL_TYPE[b.billType] ?? "Corporate Rent"}
                          </div>
                          <div style={{ fontSize: "var(--font-xs)", fontFamily: "monospace", color: "var(--text-muted)", marginTop: "2px" }}>
                            {b.invoiceNumber} &middot; Due {fmt(b.billDate)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", marginRight: "8px" }}>
                          <div style={{ fontSize: "var(--font-sm)", fontWeight: 800, color: "var(--secondary-color)" }}>{inr(b.billAmount)}</div>
                          <div style={{ marginTop: "4px" }}>{statusBadge(b.billStatus)}</div>
                        </div>
                        <div style={{ color: "var(--border-color)", fontSize: "0.85rem" }}>
                          <i className="fa-solid fa-chevron-right"></i>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
