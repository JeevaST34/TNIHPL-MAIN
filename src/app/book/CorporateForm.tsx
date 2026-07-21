"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api,
  type CorporateDocumentType,
  type Hostel,
} from "@/lib/api";

type CompanyDetails = {
  name: string;
  contactName: string;
  designation: string;
  mobile: string;
  email: string;
  address: string;
  industryType: string;
  sipcotAllottee: string;
  projectStatus: string;
  yearsInBusiness: string;
  employeeStrength: string;
  annualTurnover: string;
  existingAccommodation: string;
};

type DocKey =
  | "incorporation"
  | "employeeStrength"
  | "turnover"
  | "gstin"
  | "signatoryId";

const DOC_TYPE_MAP: Record<DocKey, CorporateDocumentType> = {
  incorporation: "IncorporationOrConsentToOperate",
  employeeStrength: "EmployeeStrengthProof",
  turnover: "AnnualTurnoverProof",
  gstin: "GstinCertificate",
  signatoryId: "SignatoryIdProof",
};

const STEPS = [
  "Company details",
  "Verify email",
  "Supporting documents",
  "Choose hostel",
  "Employee roster",
  "Review & submit",
];

export default function CorporateForm() {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<CompanyDetails>({
    name: "",
    contactName: "",
    designation: "",
    mobile: "",
    email: "",
    address: "",
    industryType: "Manufacturing",
    sipcotAllottee: "No",
    projectStatus: "Already constructed and functioning",
    yearsInBusiness: "",
    employeeStrength: "",
    annualTurnover: "",
    existingAccommodation: "",
  });
  const [docs, setDocs] = useState<Partial<Record<DocKey, string[]>>>({});
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [hostelsError, setHostelsError] = useState(false);
  const [hostelId, setHostelId] = useState("");
  const [totalBeds, setTotalBeds] = useState("10");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [rosterFile, setRosterFile] = useState<File | null>(null);
  const [rosterCount, setRosterCount] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  useEffect(() => {
    api
      .websiteHostels()
      .then((h) => {
        setHostels(h);
        setHostelsError(false);
      })
      .catch(() => {
        setHostels([]);
        setHostelsError(true);
      });
  }, []);

  function setField<K extends keyof CompanyDetails>(k: K, v: string) {
    setCompany((d) => ({ ...d, [k]: v }));
  }

  async function ensureCompany(): Promise<string> {
    if (companyId) return companyId;
    const res = await api.createCompany({
      name: company.name,
      contactName: company.contactName,
      mobile: company.mobile,
      email: company.email,
      address: company.address,
    });
    setCompanyId(res.id);
    return res.id;
  }

  async function uploadDoc(key: DocKey, file?: File) {
    if (!file) return;
    setError("");
    try {
      const id = await ensureCompany();
      await api.uploadCompanyDocument(id, DOC_TYPE_MAP[key], file);
      setDocs((d) => ({ ...d, [key]: [...(d[key] ?? []), file.name] }));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Try a smaller file.",
      );
    }
  }

  async function ensureReservation(): Promise<string> {
    if (reservationId) return reservationId;
    const id = await ensureCompany();
    const res = await api.createCorporateReservation({
      companyId: id,
      hostelId,
      totalBeds: Number(totalBeds) || 0,
      initialAdvanceAmount: 0,
      monthlyRentDiscount: 0,
      isGstExempted: false,
      contactName: company.contactName,
      contactPhone: company.mobile,
      contactEmail: company.email,
    });
    setReservationId(res.id);
    return res.id;
  }

  async function uploadRoster(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const id = await ensureReservation();
      const res = await api.uploadEmployeeRoster(id, file);
      setRosterFile(file);
      setRosterCount(res.count);
    } catch (e) {
      setRosterFile(null);
      setRosterCount(null);
      setError(
        e instanceof Error ? e.message : "Employee roster upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendOtp() {
    setBusy(true);
    setError("");
    try {
      const id = await ensureCompany();
      await api.sendCompanyOtp(id);
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail() {
    if (!companyId) return;
    setBusy(true);
    setError("");
    try {
      await api.verifyCompanyEmail(companyId, code);
      setEmailVerified(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setDoneId(reservationId ?? companyId);
  }

  const selectedHostel = hostels.find((h) => h.id === hostelId);

  const canNext =
    (step === 0 &&
      company.name &&
      company.contactName &&
      company.mobile &&
      company.email &&
      company.address) ||
    (step === 1 && emailVerified) ||
    step === 2 ||
    (step === 3 && hostelId && Number(totalBeds) > 0) ||
    (step === 4 && rosterCount !== null) ||
    step === 5;

  async function goNext() {
    if (step === 3) {
      setBusy(true);
      setError("");
      try {
        await ensureReservation();
        setStep((s) => s + 1);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not create the reservation.",
        );
      } finally {
        setBusy(false);
      }
      return;
    }
    setStep((s) => s + 1);
  }

  if (doneId) {
    return (
      <div
        style={{
          maxWidth: "580px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          border: "1px solid rgba(12, 43, 92, 0.08)",
          boxShadow: "0 20px 50px -10px rgba(12, 43, 92, 0.09), 0 1px 3px rgba(0, 0, 0, 0.02)",
          padding: "44px 32px",
          textAlign: "center",
        }}
      >
        {/* Animated Check Icon Ring */}
        <div
          style={{
            width: "72px",
            height: "72px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            backgroundColor: "#ecfdf5",
            border: "2px solid #a7f3d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.25)",
          }}
        >
          <i className="fa-solid fa-building-circle-check" style={{ fontSize: "34px", color: "#059669" }}></i>
        </div>

        {/* Badge */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 14px",
              borderRadius: "20px",
              backgroundColor: "#f0fdf4",
              color: "#166534",
              fontSize: "0.75rem",
              fontWeight: 700,
              border: "1px solid #bbf7d0",
            }}
          >
            <i className="fa-solid fa-check text-xs"></i> Corporate Request Received
          </span>
        </div>

        <h2 style={{ fontSize: "1.625rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Corporate Booking Submitted!
        </h2>

        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 auto 24px", maxWidth: "440px", lineHeight: 1.6 }}>
          Thank you. Our corporate relationship team will review your company documents and get back to <strong style={{ color: "#1252ae" }}>{company.email}</strong> once approved.
        </p>

        {/* Reference ID Card */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: "14px",
            padding: "14px 20px",
            margin: "0 auto 28px",
            maxWidth: "460px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "2px" }}>
              Corporate Reference ID
            </span>
            <span style={{ fontFamily: "monospace", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-all" }}>
              {doneId}
            </span>
          </div>
          <span style={{ padding: "4px 10px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600, color: "#475569", flexShrink: 0 }}>
            <i className="fa-solid fa-shield-halved text-emerald-500 mr-1"></i> Logged
          </span>
        </div>

        {/* Process Steps Info */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "16px",
            padding: "16px 20px",
            margin: "0 auto 28px",
            maxWidth: "460px",
            border: "1px solid #f1f5f9",
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
            Corporate Onboarding Timeline
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
            <div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <i className="fa-solid fa-id-card text-blue-600 text-sm mb-1"></i>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>1. GST Check</p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>Verification</p>
            </div>
            <div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <i className="fa-solid fa-users-rectangle text-amber-500 text-sm mb-1"></i>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>2. Roster</p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>Staff mapping</p>
            </div>
            <div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <i className="fa-solid fa-file-contract text-emerald-600 text-sm mb-1"></i>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>3. Agreement</p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>MOU Issued</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/"
            className="btn-wizard-next"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            <i className="fa-solid fa-house"></i> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-container">
      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`wizard-step ${i === step ? "active" : i < step ? "completed" : ""}`}
            onClick={() => {
              if (i < step) setStep(i);
            }}
          >
            <span className="step-num">
              {i < step ? <i className="fa-solid fa-check text-xs"></i> : i + 1}
            </span>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="wizard-card">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Company details */}
          {step === 0 && (
            <div className="wizard-pane active">
              <h3 className="text-xl font-bold mb-4">Company Details</h3>
              <div className="form-grid">
                <div className="search-group">
                  <label className="form-label">Name of Company *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={company.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Name of Contact Person *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={company.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Designation *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={company.designation}
                    onChange={(e) => setField("designation", e.target.value)}
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={company.mobile}
                    onChange={(e) => setField("mobile", e.target.value)}
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Email ID *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={company.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Industry Type *</label>
                  <select
                    className="form-control"
                    value={company.industryType}
                    onChange={(e) => setField("industryType", e.target.value)}
                  >
                    <option>Manufacturing</option>
                    <option>Electronics</option>
                    <option>Automobile</option>
                    <option>Textile</option>
                    <option>Pharmaceutical</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="search-group">
                  <label className="form-label">Whether SIPCOT Allottee *</label>
                  <select
                    className="form-control"
                    value={company.sipcotAllottee}
                    onChange={(e) =>
                      setField("sipcotAllottee", e.target.value)
                    }
                  >
                    <option>Yes</option>
                    <option>No</option>
                    <option>Any Other</option>
                  </select>
                </div>
                <div className="search-group">
                  <label className="form-label">Existing Project Status *</label>
                  <select
                    className="form-control"
                    value={company.projectStatus}
                    onChange={(e) =>
                      setField("projectStatus", e.target.value)
                    }
                  >
                    <option>New Project - Under construction</option>
                    <option>Construction In - Progress</option>
                    <option>Already constructed and functioning</option>
                  </select>
                </div>
                <div className="search-group form-group-full">
                  <label className="form-label">Company Address *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={company.address}
                    onChange={(e) => setField("address", e.target.value)}
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">
                    No. of Years in Business *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5 years"
                    value={company.yearsInBusiness}
                    onChange={(e) =>
                      setField("yearsInBusiness", e.target.value)
                    }
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Employee Strength *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 250"
                    value={company.employeeStrength}
                    onChange={(e) =>
                      setField("employeeStrength", e.target.value)
                    }
                  />
                </div>
                <div className="search-group">
                  <label className="form-label">Annual Turnover *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. INR 10 Cr"
                    value={company.annualTurnover}
                    onChange={(e) =>
                      setField("annualTurnover", e.target.value)
                    }
                  />
                </div>
                <div className="search-group form-group-full">
                  <label className="form-label">
                    Existing Accommodation Details for Employees
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={company.existingAccommodation}
                    onChange={(e) =>
                      setField("existingAccommodation", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Verify email */}
          {step === 1 && (
            <div className="wizard-pane active" style={{ maxWidth: "520px", margin: "0 auto" }}>
              {/* Header icon + title */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #1252ae 0%, #0c2b5c 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 10px 28px -6px rgba(18, 82, 174, 0.35)"
                }}>
                  <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: "26px", color: "#ffffff" }}></i>
                </div>
                <h3 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Verify Your Company Email
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                  We will send a 6-digit code to{" "}
                  <strong style={{ color: "#1252ae" }}>{company.email}</strong>{" "}
                  to verify your company before you continue.
                </p>
              </div>

              {emailVerified ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "16px 20px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: "1.5px solid #86efac",
                  boxShadow: "0 4px 16px -4px rgba(16, 185, 129, 0.2)"
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "#10b981", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                  }}>
                    <i className="fa-solid fa-check" style={{ color: "#ffffff", fontSize: "16px" }}></i>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.9375rem", color: "#065f46" }}>Email Verified</p>
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "#059669" }}>Your company email has been confirmed successfully.</p>
                  </div>
                </div>
              ) : !otpSent ? (
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: "16px", padding: "24px", textAlign: "center"
                }}>
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "0.8125rem", fontWeight: 600, color: "#475569" }}>Sending code to:</p>
                    <p style={{
                      margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a",
                      background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px",
                      padding: "10px 16px", display: "inline-block", wordBreak: "break-all"
                    }}>
                      <i className="fa-solid fa-envelope mr-2" style={{ color: "#1252ae", marginRight: "3px" }}></i>
                      {company.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-wizard-next"
                    onClick={sendOtp}
                    disabled={busy || !company.email}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    {busy ? "Sending Code…" : "Send Verification Code"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* OTP sent banner */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 16px", borderRadius: "12px",
                    background: "#eff6ff", border: "1px solid #bfdbfe"
                  }}>
                    <i className="fa-solid fa-circle-info" style={{ color: "#1252ae", fontSize: "15px", flexShrink: 0 }}></i>
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "#1e40af" }}>
                      A 6-digit code was sent to <strong>{company.email}</strong>. Check your inbox.
                    </p>
                  </div>

                  {/* OTP input */}
                  <div className="search-group" style={{ margin: 0 }}>
                    <label className="form-label">Enter 6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control"
                      placeholder="_ _ _ _ _ _"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{
                        textAlign: "center", fontFamily: "monospace",
                        fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.35em",
                        padding: "14px"
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-wizard-next"
                    onClick={verifyEmail}
                    disabled={busy || code.length !== 6}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <i className="fa-solid fa-shield-check"></i>
                    {busy ? "Verifying…" : "Verify Code"}
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      style={{
                        background: "none", border: "none", cursor: busy ? "not-allowed" : "pointer",
                        fontSize: "0.8125rem", color: busy ? "#94a3b8" : "#1252ae",
                        fontWeight: 600, padding: 0,
                        textDecoration: "underline", textUnderlineOffset: "3px"
                      }}
                      onClick={sendOtp}
                      disabled={busy}
                    >
                      Didn&apos;t receive a code? Resend
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Supporting documents */}
          {step === 2 && (
            <div className="wizard-pane active">
              <h3 className="text-xl font-bold mb-2">Supporting Documents</h3>
              <p className="text-sm text-slate-500 mb-6">
                Upload up to 5 files per category. Max 10 MB per file. JPG,
                PNG or PDF.
              </p>
              <div className="form-grid">
                <DocUploadBox
                  label="Certificate of Incorporation / Consent to Operate"
                  icon="fa-solid fa-file-contract"
                  sublabel="Proof of years in business"
                  count={docs.incorporation?.length ?? 0}
                  onPick={(f) => uploadDoc("incorporation", f)}
                />
                <DocUploadBox
                  label="Employee Strength Proof"
                  icon="fa-solid fa-users"
                  sublabel="CA certificate / PF / ESI returns"
                  count={docs.employeeStrength?.length ?? 0}
                  onPick={(f) => uploadDoc("employeeStrength", f)}
                />
                <DocUploadBox
                  label="Annual Turnover Proof"
                  icon="fa-solid fa-chart-line"
                  sublabel="Audited financials (last 3 FYs)"
                  count={docs.turnover?.length ?? 0}
                  onPick={(f) => uploadDoc("turnover", f)}
                />
                <DocUploadBox
                  label="GSTIN Certificate"
                  icon="fa-solid fa-receipt"
                  sublabel="GST REG-06 or filing copy"
                  count={docs.gstin?.length ?? 0}
                  onPick={(f) => uploadDoc("gstin", f)}
                />
                <DocUploadBox
                  label="Authorized Signatory ID Proof"
                  icon="fa-solid fa-id-badge"
                  sublabel="Aadhaar / PAN of contact person"
                  count={docs.signatoryId?.length ?? 0}
                  onPick={(f) => uploadDoc("signatoryId", f)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Choose hostel */}
          {step === 3 && (
            <div className="wizard-pane active">
              <h3 className="text-xl font-bold mb-2">
                Select Hostel &amp; Bed Requirement
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Choose the hostel and number of beds required for your
                workforce.
              </p>
              <div className="form-grid">
                <div className="search-group">
                  <label className="form-label">Hostel Location &amp; Name *</label>
                  <select
                    className="form-control"
                    value={hostelId}
                    onChange={(e) => setHostelId(e.target.value)}
                  >
                    <option value="">— Select a Hostel —</option>
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.locationName ? `(${h.locationName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="search-group">
                  <label className="form-label">No. of Beds Required *</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                  />
                </div>
              </div>

              {hostels.length === 0 &&
                (hostelsError ? (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm mt-4">
                    Couldn&apos;t load hostels list right now. Please refresh
                    or submit enquiry.
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm mt-4">
                    No hostels listed. Please send an enquiry via our contact
                    form.
                  </div>
                ))}
            </div>
          )}

          {/* Step 5: Employee roster */}
          {step === 4 && (
            <div className="wizard-pane active">
              <h3 className="text-xl font-bold mb-2">
                Upload Employee Roster
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Upload an Excel (.xlsx) file listing your workforce for this
                booking — Name, Aadhaar No, Mobile, Employee ID, Address,
                Designation, DOB and Email columns.{" "}
                <a
                  href="/templates/corporate-employee-template.xlsx"
                  className="text-blue-600 hover:underline font-semibold"
                  download
                >
                  Download the template
                </a>
                .
              </p>

              <div className="search-group">
                <label className="form-label">Employee Roster (.xlsx) *</label>
                <div
                  className={`upload-drag-area ${rosterCount !== null ? "border-emerald-500 bg-emerald-50" : ""}`}
                >
                  <span className="upload-icon">
                    {rosterCount !== null ? "✅" : "📊"}
                  </span>
                  <p className="text-xs text-slate-500 mb-1">
                    Excel file, up to 5 MB
                  </p>
                  <div className="upload-filename font-semibold text-xs text-blue-600">
                    {rosterCount !== null
                      ? `${rosterFile?.name} — ${rosterCount} employee(s) imported ✓`
                      : busy
                        ? "Uploading…"
                        : "Click to browse file"}
                  </div>
                  <input
                    type="file"
                    accept=".xlsx"
                    className="upload-input-file cursor-pointer"
                    onChange={(e) => {
                      uploadRoster(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review & submit */}
          {step === 5 && (
            <div className="wizard-pane active" style={{ maxWidth: "540px", margin: "0 auto" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #1252ae 0%, #0c2b5c 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 10px 28px -6px rgba(18, 82, 174, 0.35)"
                }}>
                  <i className="fa-solid fa-clipboard-check" style={{ fontSize: "26px", color: "#ffffff" }}></i>
                </div>
                <h3 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Review &amp; Submit
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                  Please confirm your booking details before final submission.
                </p>
              </div>

              {/* Details card */}
              <div style={{
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: "16px", overflow: "hidden",
                boxShadow: "0 4px 20px -6px rgba(12, 43, 92, 0.08)",
                marginBottom: "20px"
              }}>
                {/* Card header strip */}
                <div style={{
                  background: "linear-gradient(135deg, #0c2b5c 0%, #1252ae 100%)",
                  padding: "12px 20px"
                }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Booking Summary
                  </p>
                </div>

                {/* Rows */}
                {[
                  { icon: "fa-solid fa-building", label: "Company", value: company.name || "—" },
                  { icon: "fa-solid fa-hotel", label: "Hostel", value: selectedHostel ? `${selectedHostel.name}${selectedHostel.locationName ? ` (${selectedHostel.locationName})` : ""}` : "Not selected" },
                  { icon: "fa-solid fa-bed", label: "Beds Requested", value: totalBeds },
                  { icon: "fa-solid fa-users", label: "Employees Uploaded", value: `${rosterCount ?? 0} employee(s)` },
                  { icon: "fa-solid fa-envelope-circle-check", label: "Company Email", value: company.email || "—" },
                ].map((row, idx, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 20px",
                      borderBottom: idx < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                      background: idx % 2 === 0 ? "#ffffff" : "#fafbfc"
                    }}
                  >
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, border: "1px solid #bfdbfe"
                    }}>
                      <i className={row.icon} style={{ fontSize: "14px", color: "#1252ae" }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{row.label}</p>
                      <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email verified badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", borderRadius: "12px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                border: "1.5px solid #86efac",
                marginBottom: "16px"
              }}>
                <i className="fa-solid fa-circle-check" style={{ color: "#10b981", fontSize: "18px", flexShrink: 0 }}></i>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#065f46", fontWeight: 600, lineHeight: 1.5 }}>
                  Company email verified. Our team will review your documents and roster before approving the booking.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="wizard-footer">
            <button
              type="button"
              className="btn-wizard-back"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <i
                className="fa-solid fa-arrow-left"
                style={{ fontSize: "0.85rem" }}
              ></i>{" "}
              Back
            </button>

            {step < 5 ? (
              <button
                type="button"
                className="btn-wizard-next"
                onClick={goNext}
                disabled={!canNext || busy}
              >
                {busy ? "Please wait…" : "Continue"}{" "}
                {!busy && (
                  <i
                    className="fa-solid fa-arrow-right"
                    style={{ fontSize: "0.85rem" }}
                  ></i>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="btn-wizard-next"
                onClick={submit}
                disabled={busy}
              >
                {busy ? "Submitting Request…" : "Submit Corporate Request"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function DocUploadBox({
  label,
  sublabel,
  icon,
  count,
  onPick,
}: {
  label: string;
  sublabel?: string;
  icon?: string;
  count: number;
  onPick: (f?: File) => void;
}) {
  const done = count > 0;
  return (
    <div className="search-group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="form-label mb-0">{label}</label>
        {done && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-xs"></i> {count} File(s)
          </span>
        )}
      </div>

      <div
        className={`upload-drag-area group relative ${done ? "upload-done border-emerald-500 bg-emerald-50/50" : ""}`}
      >
        <div className="upload-icon-box">
          <i className={done ? "fa-solid fa-check text-white" : icon ?? "fa-solid fa-cloud-arrow-up"}></i>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">
            {sublabel ?? "Upload document file"}
          </p>

          <div className="upload-filename font-bold text-xs">
            {done ? (
              <span className="text-emerald-700 flex items-center justify-center gap-1">
                <i className="fa-solid fa-paperclip text-xs"></i> {count} Document(s) Uploaded ✓
              </span>
            ) : (
              <span className="text-blue-600 group-hover:text-blue-700 transition-colors flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-arrow-up-from-bracket text-xs"></i> Click to browse file
              </span>
            )}
          </div>
        </div>

        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 bg-slate-100/80 px-2.5 py-0.5 rounded-full">
          JPG • PNG • PDF
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="upload-input-file cursor-pointer"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
