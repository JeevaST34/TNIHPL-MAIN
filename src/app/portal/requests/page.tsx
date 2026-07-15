"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalHeader, { PortalSubnav } from "@/components/PortalHeader";
import { Footer } from "@/components/StaticSections";
import { resident, getToken, REQUEST_STATUS, REQUEST_PRIORITY, type ResidentServiceRequest } from "@/lib/resident";

function statusBadge(s: number) {
  const cls = s === 3 ? "status-badge status-available" : s === 4 ? "status-badge" : s === 2 ? "status-badge" : "status-badge status-sold-out";
  return <span className={cls}>{REQUEST_STATUS[s] ?? "—"}</span>;
}

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ResidentServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    try {
      setRequests(await resident.serviceRequests());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your requests.");
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await resident.createServiceRequest({ type: type.trim() || null, problemDescription: description.trim(), priority });
      setType("");
      setDescription("");
      setPriority(2);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <main className="min-h-screen bg-slate-50">
      <PortalHeader />

      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-headset"></i> SERVICE &amp; MAINTENANCE
              </span>
              <h1 className="breadcrumbs-title">Service Requests</h1>
              <p className="hero-subtitle-text">
                Raise maintenance tickets for plumbing, electrical, Wi-Fi or housekeeping &amp; track resolution status.
              </p>
            </div>
          </div>
        </div>
      </div>
      <PortalSubnav />

      <div className="portal-section-wrapper">
        <div className="container max-w-4xl mx-auto">
          {/* Raise a request */}
          <div className="portal-card">
            <div className="portal-card-title">
              <i className="fa-solid fa-circle-plus"></i> Raise a Request
            </div>
            <form onSubmit={submit}>
              <div className="form-grid-2">
                <div className="portal-form-group">
                  <label className="portal-form-label">Category <span>(optional)</span></label>
                  <input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Plumbing, Electrical, Wi-Fi, AC"
                    maxLength={100}
                    className="portal-form-control"
                  />
                </div>
                <div className="portal-form-group">
                  <label className="portal-form-label">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="portal-form-control"
                  >
                    {Object.entries(REQUEST_PRIORITY).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="portal-form-group">
                <label className="portal-form-label">Describe the problem</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={2000}
                  placeholder="Describe the issue so our team can help..."
                  className="portal-form-control portal-form-textarea"
                />
              </div>

              {formError && <p style={{ color: "var(--danger-color)", fontSize: "var(--font-sm)", marginBottom: "16px" }}>{formError}</p>}

              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="btn-portal-submit"
              >
                <i className="fa-solid fa-paper-plane"></i> {submitting ? "Submitting Ticket…" : "Submit Request"}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="portal-card">
            <div className="portal-card-title">
              <i className="fa-solid fa-list-check"></i> Your Requests
            </div>

            {loading ? (
              <div className="text-center text-slate-500" style={{ padding: "30px 0" }}>
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
                Loading your service tickets…
              </div>
            ) : error ? (
              <div style={{ color: "var(--danger-color)", padding: "12px 0" }}>
                {error}
              </div>
            ) : requests.length === 0 ? (
              <p className="portal-empty-msg">
                <i className="fa-regular fa-circle-dot mr-1"></i> You haven&apos;t raised any requests yet.
              </p>
            ) : (
              <div className="portal-requests-list">
                {requests.map((r) => (
                  <div key={r.id} className="user-req-card" style={{ flexDirection: "column", alignItems: "stretch", gap: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                          {r.type ? (
                            <span className="status-tag status-tag-reserved" style={{ fontSize: "0.65rem", padding: "2px 10px" }}>
                              {r.type}
                            </span>
                          ) : (
                            <span className="status-tag" style={{ fontSize: "0.65rem", padding: "2px 10px" }}>
                              General
                            </span>
                          )}
                          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                            {REQUEST_PRIORITY[r.priority]} Priority
                          </span>
                        </div>
                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--secondary-color)", margin: 0 }}>
                          {r.problemDescription}
                        </p>
                      </div>
                      <div>{statusBadge(r.status)}</div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "var(--font-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                      <span><i className="fa-regular fa-calendar mr-1"></i> Raised {fmt(r.requestedDate)}</span>
                      {r.status === 3 || r.status === 4 ? (
                        <span><i className="fa-solid fa-check mr-1" style={{ color: "var(--color-available)" }}></i> Closed {fmt(r.completedDate)}</span>
                      ) : (
                        <span><i className="fa-solid fa-hourglass-half mr-1" style={{ color: "var(--accent-color)" }}></i> {r.daysOpen} day{r.daysOpen === 1 ? "" : "s"} open</span>
                      )}
                    </div>

                    {r.comments && (
                      <div style={{ marginTop: "4px", padding: "12px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-xs)", color: "var(--text-body)" }}>
                        <strong style={{ color: "var(--secondary-color)" }}>Staff Note:</strong> {r.comments}
                      </div>
                    )}
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
