"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalHeader, { PortalSubnav } from "@/components/PortalHeader";
import { Footer } from "@/components/StaticSections";
import {
  resident,
  getToken,
  REFUND_STATUS,
  REFUND_REASON,
  STAY_CHANGE_KIND,
  type ResidentRefund,
} from "@/lib/resident";

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function refundBadge(s: number) {
  const cls = s === 4 ? "status-badge status-available" : s === 5 ? "status-badge status-sold-out" : s === 3 ? "status-badge" : "status-badge";
  return <span className={cls}>{REFUND_STATUS[s] ?? "—"}</span>;
}

function BankForm({ refund, onSaved }: { refund: ResidentRefund; onSaved: () => void }) {
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState(refund.bankHolderName ?? "");
  const [bankName, setBankName] = useState(refund.bankName ?? "");
  const [ifsc, setIfsc] = useState(refund.bankIfsc ?? "");
  const [branch, setBranch] = useState(refund.bankBranch ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await resident.submitBankDetails(refund.id, {
        accountNumber: accountNumber.trim(),
        holderName: holderName.trim(),
        bankName: bankName.trim() || null,
        ifsc: ifsc.trim().toUpperCase(),
        branch: branch.trim() || null,
      });
      setDone(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your bank details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: "24px", padding: "20px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)" }}>
      <h4 style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--secondary-color)", marginBottom: "4px" }}>
        {refund.bankAccountMasked ? "Update Bank Account for Transfer" : "Provide Bank Account Details for Deposit Refund"}
      </h4>
      {refund.bankAccountMasked && (
        <p style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginBottom: "16px" }}>On file: {refund.bankHolderName} &middot; {refund.bankAccountMasked} &middot; {refund.bankIfsc}</p>
      )}
      <div className="form-grid-2" style={{ marginTop: "16px" }}>
        <div className="portal-form-group">
          <label className="portal-form-label">Account Number *</label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            inputMode="numeric"
            placeholder="Account number"
            className="portal-form-control"
          />
        </div>
        <div className="portal-form-group">
          <label className="portal-form-label">Account Holder Name *</label>
          <input
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            required
            placeholder="Account holder name"
            className="portal-form-control"
          />
        </div>
        <div className="portal-form-group">
          <label className="portal-form-label">IFSC Code *</label>
          <input
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value)}
            required
            maxLength={11}
            placeholder="e.g. HDFC0001234"
            className="portal-form-control uppercase"
            style={{ textTransform: "uppercase" }}
          />
        </div>
        <div className="portal-form-group">
          <label className="portal-form-label">Bank Name</label>
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Bank name"
            className="portal-form-control"
          />
        </div>
      </div>
      <div className="portal-form-group" style={{ gridColumn: "span 2" }}>
        <label className="portal-form-label">Branch Name</label>
        <input
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="Branch location"
          className="portal-form-control"
        />
      </div>
      {error && <p style={{ color: "var(--danger-color)", fontSize: "var(--font-xs)", marginTop: "12px", fontWeight: 600 }}>{error}</p>}
      {done && !error && <p style={{ color: "var(--color-available)", fontSize: "var(--font-xs)", marginTop: "12px", fontWeight: 600 }}>Saved. Our finance team will initiate the transfer.</p>}
      <button type="submit" disabled={saving} className="btn-portal-submit" style={{ marginTop: "16px", padding: "10px 20px", fontSize: "0.8rem" }}>
        <i className="fa-solid fa-floppy-disk"></i> {saving ? "Saving Bank Details…" : "Save Bank Details"}
      </button>
    </form>
  );
}

export default function RefundsPage() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<ResidentRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // stay-change form
  const [kind, setKind] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formDone, setFormDone] = useState(false);

  async function load() {
    try {
      setRefunds(await resident.refunds());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your refunds.");
      if (!getToken()) router.replace("/portal/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function submitStayChange(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormDone(false);
    try {
      await resident.createStayChange({ kind, note: note.trim() || null });
      setNote("");
      setFormDone(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PortalHeader />

      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-rotate-left"></i> REFUNDS &amp; STAY CHANGES
              </span>
              <h1 className="breadcrumbs-title">Stay Changes &amp; Refunds</h1>
              <p className="hero-subtitle-text">
                Submit move-out notice, room transfer requests &amp; track security deposit refunds.
              </p>
            </div>
          </div>
        </div>
      </div>
      <PortalSubnav />
      <div className="portal-section-wrapper">
        <div className="container max-w-4xl mx-auto">
          {/* Stay-change request */}
          <div className="portal-card">
            <div className="portal-card-title">
              <i className="fa-solid fa-person-walking-arrow-right"></i> Request a Stay Change or Vacate Notice
            </div>
            <p style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: "20px" }}>
              Give notice to vacate your bed, request a room/hostel transfer, or extend your stay duration.
            </p>
            <form onSubmit={submitStayChange}>
              <div className="form-grid-2">
                <div className="portal-form-group">
                  <label className="portal-form-label">Request Type *</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(Number(e.target.value))}
                    className="portal-form-control"
                  >
                    {Object.entries(STAY_CHANGE_KIND).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Notes / Preferred Dates</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={2000}
                    placeholder="e.g. Preferred vacate date, room type preference..."
                    className="portal-form-control"
                  />
                </div>
              </div>

              {formError && <p style={{ color: "var(--danger-color)", fontSize: "var(--font-sm)", marginBottom: "16px" }}>{formError}</p>}
              {formDone && !formError && (
                <p style={{ color: "var(--color-available)", fontSize: "var(--font-sm)", marginBottom: "16px", fontWeight: 600 }}>
                  Request submitted successfully! You can track progress under Requests.
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn-portal-submit">
                <i className="fa-solid fa-paper-plane"></i> {submitting ? "Submitting Request…" : "Submit Change Request"}
              </button>
            </form>
          </div>

          {/* Refunds List */}
          <div className="portal-card">
            <div className="portal-card-title">
              <i className="fa-solid fa-receipt"></i> Deposit Refunds
            </div>

            {loading ? (
              <div className="text-center text-slate-500" style={{ padding: "30px 0" }}>
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
                Loading refund status…
              </div>
            ) : error ? (
              <div style={{ color: "var(--danger-color)", padding: "12px 0" }}>
                {error}
              </div>
            ) : refunds.length === 0 ? (
              <p className="portal-empty-msg">
                <i className="fa-regular fa-circle-dot mr-1"></i> No deposit refunds active. Refund calculations are created when your stay closes.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {refunds.map((r) => (
                  <div key={r.id} style={{ padding: "20px", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "16px", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontFamily: "monospace", fontSize: "var(--font-xs)", color: "var(--text-muted)", fontWeight: 600 }}>{r.refundId}</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-color)", marginTop: "4px" }}>{inr(r.amountToPay)}</div>
                        <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                          {REFUND_REASON[r.reason]} &middot; Raised {fmt(r.createdAt)}
                        </div>
                      </div>
                      <div>{refundBadge(r.refundStatus)}</div>
                    </div>

                    <div className="resident-info-grid" style={{ padding: "12px", background: "var(--bg-light)", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
                      <div className="info-tile">
                        <span className="info-tile-label">Deposit Paid</span>
                        <span className="info-tile-value">{inr(r.advancePaid)}</span>
                      </div>
                      <div className="info-tile">
                        <span className="info-tile-label">Deductions</span>
                        <span className="info-tile-value">{inr(r.totalDeductions)}</span>
                      </div>
                      <div className="info-tile">
                        <span className="info-tile-label">Refundable</span>
                        <span className="info-tile-value" style={{ color: "var(--color-available)" }}>{inr(r.totalRefundAmount)}</span>
                      </div>
                      <div className="info-tile">
                        <span className="info-tile-label">Duration</span>
                        <span className="info-tile-value">{r.stayedDays} days stayed</span>
                      </div>
                    </div>

                    {r.refundStatus === 5 && r.refundRejectionReason && (
                      <div style={{ padding: "12px", background: "var(--danger-soft)", border: "1px solid var(--danger-color)", borderRadius: "var(--radius-sm)", color: "var(--danger-color)", fontSize: "var(--font-xs)", marginBottom: "12px" }}>
                        <strong>Rejection reason:</strong> {r.refundRejectionReason}
                      </div>
                    )}
                    {r.refundStatus === 4 && (
                      <div style={{ padding: "12px", background: "var(--success-soft)", border: "1px solid var(--success-color)", borderRadius: "var(--radius-sm)", color: "var(--success-color)", fontSize: "var(--font-xs)", marginBottom: "12px" }}>
                        Settled to bank account {r.bankAccountMasked ?? ""}.
                      </div>
                    )}

                    {r.canSubmitBankDetails && <BankForm refund={r} onSaved={load} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
