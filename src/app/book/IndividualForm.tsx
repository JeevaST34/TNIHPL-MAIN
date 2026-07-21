"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, type Hostel } from "@/lib/api";

type Details = {
  name: string;
  email: string;
  mobile: string;
  residentType: string;
  dob: string;
  typeOfStay: string;
  permanentAddress: string;
  aadhaarNumber: string;
};

type Docs = {
  recentPhoto?: string;
  addressProof?: string;
  panCard?: string;
  orgProofOfEmployment?: string;
};

const STEPS = ["Choose hostel", "Your details", "Documents", "Verify & submit"];

export default function IndividualForm() {
  const searchParams = useSearchParams();
  const preselectedHostelId = searchParams.get("hostelId") ?? "";
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>({
    name: "",
    email: "",
    mobile: "",
    residentType: "Individual",
    dob: "",
    typeOfStay: "Monthly",
    permanentAddress: "",
    aadhaarNumber: "",
  });
  const [docs, setDocs] = useState<Docs>({});
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [hostelsError, setHostelsError] = useState(false);
  const [district, setDistrict] = useState("");
  const [hostelId, setHostelId] = useState(preselectedHostelId);
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  useEffect(() => {
    api
      .websiteHostels()
      .then((h) => {
        setHostels(h);
        setHostelsError(false);
        if (preselectedHostelId) {
          const match = h.find((x) => x.id === preselectedHostelId);
          if (match?.locationName) setDistrict(match.locationName);
        }
      })
      .catch(() => {
        setHostels([]);
        setHostelsError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField<K extends keyof Details>(k: K, v: string) {
    setDetails((d) => ({ ...d, [k]: v }));
  }

  async function upload(field: keyof Docs, file?: File) {
    if (!file) return;
    setError("");
    try {
      const key = await api.uploadFile(file, "registrations");
      setDocs((d) => ({ ...d, [field]: key }));
    } catch {
      setError("Upload failed. Please try a smaller JPG/PNG/PDF.");
    }
  }

  async function sendOtp() {
    setBusy(true);
    setError("");
    try {
      await api.sendOtp(details.email, "registration");
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await api.submitRegistration({
        email: details.email,
        code,
        name: details.name,
        mobile: details.mobile,
        residentType: details.residentType,
        permanentAddress: details.permanentAddress,
        dob: details.dob || null,
        typeOfStay: details.typeOfStay,
        hostelId: hostelId || null,
        aadhaarNumber: details.aadhaarNumber,
        recentPhoto: docs.recentPhoto ?? null,
        addressProof: docs.addressProof ?? null,
        panCard: docs.panCard ?? null,
        orgProofOfEmployment: docs.orgProofOfEmployment ?? null,
        hasMedicalIllness: false,
        foodOpted: false,
      });
      setDoneId(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setBusy(false);
    }
  }

  const districts = Array.from(
    new Set(hostels.map((h) => h.locationName).filter((v): v is string => !!v)),
  );
  const filteredHostels = district
    ? hostels.filter((h) => h.locationName === district)
    : hostels;
  const selectedHostel = hostels.find((h) => h.id === hostelId);

  const aadhaarValid = /^\d{12}$/.test(details.aadhaarNumber);
  const canNext =
    step === 0 ||
    (step === 1 &&
      details.name &&
      details.email &&
      details.mobile &&
      aadhaarValid) ||
    step === 2 ||
    step === 3;

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
          <i className="fa-solid fa-circle-check" style={{ fontSize: "36px", color: "#059669" }}></i>
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
            <i className="fa-solid fa-check text-xs"></i> Application Received
          </span>
        </div>

        <h2 style={{ fontSize: "1.625rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Booking Request Submitted!
        </h2>

        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 auto 24px", maxWidth: "440px", lineHeight: 1.6 }}>
          Thank you, <strong style={{ color: "#0f172a" }}>{details.name}</strong>. Our team will review your application and send the confirmation email to <strong style={{ color: "#1252ae" }}>{details.email}</strong>.
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
              Reference ID
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
            What happens next?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center" }}>
            <div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <i className="fa-solid fa-file-signature text-blue-600 text-sm mb-1"></i>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>1. Review</p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>Within 24h</p>
            </div>
            <div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <i className="fa-solid fa-bed text-amber-500 text-sm mb-1"></i>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>2. Allotment</p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>Bed assigned</p>
            </div>
            <div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <i className="fa-solid fa-key text-emerald-600 text-sm mb-1"></i>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>3. Check-in</p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>Bring ID proof</p>
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
          {/* Step 1: Choose hostel (District -> Hostel -> Room Type) */}
          {step === 0 && (
            <div className="wizard-pane active">
              <h3 className="text-xl font-bold mb-2">
                Select Your Preferred Hostel
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Choose from our available properties across Tamil Nadu.
              </p>

              <div className="form-grid">
                <div className="search-group">
                  <label className="form-label">District / Location</label>
                  <select
                    className="form-control"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setHostelId("");
                    }}
                  >
                    <option value="">— All Districts —</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-group">
                  <label className="form-label">Hostel *</label>
                  <select
                    className="form-control"
                    value={hostelId}
                    onChange={(e) => setHostelId(e.target.value)}
                  >
                    <option value="">— Select a Hostel —</option>
                    {filteredHostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.locationName ? `(${h.locationName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-group">
                  <label className="form-label">Type of Stay</label>
                  <select
                    className="form-control"
                    value={details.typeOfStay}
                    onChange={(e) => setField("typeOfStay", e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Short stay">Short stay</option>
                  </select>
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

          {/* Step 2: Your details */}
          {step === 1 && (
            <div className="wizard-pane active">
              <h3 className="text-xl font-bold mb-4">
                Enter Personal Details
              </h3>
              <div className="form-grid">
                <div className="search-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    value={details.name}
                    onChange={(e) => setField("name", e.target.value)}
                    required
                  />
                </div>

                <div className="search-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="9876543210"
                    value={details.mobile}
                    onChange={(e) => setField("mobile", e.target.value)}
                    required
                  />
                </div>

                <div className="search-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={details.email}
                    onChange={(e) => setField("email", e.target.value)}
                    required
                  />
                </div>

                <div className="search-group">
                  <label className="form-label">Aadhaar Number *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    className="form-control"
                    placeholder="12-digit Aadhaar number"
                    value={details.aadhaarNumber}
                    onChange={(e) =>
                      setField(
                        "aadhaarNumber",
                        e.target.value.replace(/\D/g, "").slice(0, 12),
                      )
                    }
                    required
                  />
                  {details.aadhaarNumber.length > 0 && !aadhaarValid && (
                    <p className="text-xs text-rose-600 mt-1">
                      Aadhaar number must be exactly 12 digits.
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    One Aadhaar number can only be used for one active booking.
                  </p>
                </div>

                <div className="search-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={details.dob}
                    onChange={(e) => setField("dob", e.target.value)}
                  />
                </div>

                <div className="search-group">
                  <label className="form-label">Resident Type</label>
                  <select
                    className="form-control"
                    value={details.residentType}
                    onChange={(e) => setField("residentType", e.target.value)}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Student">Student</option>
                    <option value="Working professional">
                      Working professional
                    </option>
                  </select>
                </div>

                <div className="search-group form-group-full">
                  <label className="form-label">Permanent Address</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="123 Street Address, City, Pincode"
                    value={details.permanentAddress}
                    onChange={(e) =>
                      setField("permanentAddress", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 2 && (
            <div className="wizard-pane active">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Upload Identification Documents
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Please upload high-quality scans or photos to speed up instant allotment verification.
                  </p>
                </div>
                {/* <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 self-start sm:self-center">
                  <i className="fa-solid fa-shield-halved text-blue-600"></i> Secure 256-Bit Upload
                </span> */}
              </div>

              <div className="form-grid">
                <UploadBox
                  label="Recent Photo"
                  icon="fa-solid fa-user-tag"
                  sublabel="Clear passport size photo"
                  done={!!docs.recentPhoto}
                  onPick={(f) => upload("recentPhoto", f)}
                />
                <UploadBox
                  label="Aadhaar Card"
                  icon="fa-solid fa-id-card"
                  sublabel="Address & identity proof (Front & Back)"
                  done={!!docs.addressProof}
                  onPick={(f) => upload("addressProof", f)}
                />
                <UploadBox
                  label="PAN Card"
                  icon="fa-solid fa-file-invoice-dollar"
                  sublabel="Valid PAN card copy"
                  done={!!docs.panCard}
                  onPick={(f) => upload("panCard", f)}
                />
                {details.residentType === "Student" && (
                  <UploadBox
                    label="College / Institution ID"
                    icon="fa-solid fa-graduation-cap"
                    sublabel="Valid student ID or admission letter"
                    done={!!docs.orgProofOfEmployment}
                    onPick={(f) => upload("orgProofOfEmployment", f)}
                  />
                )}
                {details.residentType === "Working professional" && (
                  <UploadBox
                    label="Employer ID / Offer Letter"
                    icon="fa-solid fa-briefcase"
                    sublabel="Company ID or employment proof"
                    done={!!docs.orgProofOfEmployment}
                    onPick={(f) => upload("orgProofOfEmployment", f)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 4: Verify & submit */}
          {step === 3 && (
            <div className="wizard-pane active" style={{ maxWidth: "480px", margin: "0 auto" }}>

              {/* Title */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Review &amp; Verify</h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "4px", margin: "4px 0 0" }}>Confirm your details, then verify your email to submit.</p>
              </div>

              {/* Summary Card */}
              <div style={{
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                marginBottom: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}>
                {/* Card Header */}
                <div style={{
                  background: "linear-gradient(90deg, #1252ae08 0%, #1252ae04 100%)",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #1252ae, #0c2b5c)"
                  }}></div>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Booking Summary
                  </span>
                </div>

                {/* Rows */}
                {[
                  {
                    icon: "fa-building-columns",
                    color: "#3b82f6",
                    bg: "#eff6ff",
                    label: "Hostel",
                    value: selectedHostel
                      ? `${selectedHostel.name}${selectedHostel.locationName ? ` · ${selectedHostel.locationName}` : ""}`
                      : null,
                    placeholder: "Not selected",
                  },
                  {
                    icon: "fa-user",
                    color: "#8b5cf6",
                    bg: "#f5f3ff",
                    label: "Resident Type",
                    value: details.residentType,
                    placeholder: null,
                  },
                  {
                    icon: "fa-id-card",
                    color: "#f59e0b",
                    bg: "#fffbeb",
                    label: "Aadhaar",
                    value: details.aadhaarNumber ? `XXXX XXXX ${details.aadhaarNumber.slice(-4)}` : null,
                    placeholder: "Not entered",
                    mono: true,
                  },
                  {
                    icon: "fa-paperclip",
                    color: "#10b981",
                    bg: "#ecfdf5",
                    label: "Documents",
                    value: [
                      docs.recentPhoto && "Photo",
                      docs.addressProof && "Aadhaar",
                      docs.panCard && "PAN",
                      docs.orgProofOfEmployment && "ID proof",
                    ].filter(Boolean).join(", ") || null,
                    placeholder: "None uploaded",
                  },
                ].map((row, idx, arr) => (
                  <div key={row.label} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "11px 16px",
                    borderBottom: idx < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                    background: idx % 2 === 0 ? "#ffffff" : "#fafbfc",
                    gap: "12px"
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px",
                      background: row.bg, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0
                    }}>
                      <i className={`fa-solid ${row.icon}`} style={{ fontSize: "11px", color: row.color }}></i>
                    </div>
                    {/* Label */}
                    <span style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500, width: "100px", flexShrink: 0 }}>
                      {row.label}
                    </span>
                    {/* Value */}
                    <span style={{
                      fontSize: "0.875rem",
                      fontWeight: row.value ? 700 : 400,
                      color: row.value ? "#0f172a" : "#94a3b8",
                      fontStyle: row.value ? "normal" : "italic",
                      fontFamily: row.mono && row.value ? "monospace" : "inherit",
                      marginLeft: "auto",
                      textAlign: "right"
                    }}>
                      {row.value ?? row.placeholder}
                    </span>
                  </div>
                ))}
              </div>

              {/* Email Verification Panel */}
              {!otpSent ? (
                <div style={{
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}>
                  {/* Top info strip */}
                  <div style={{
                    background: "#f8faff",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "#dbeafe", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <i className="fa-solid fa-envelope" style={{ fontSize: "15px", color: "#1252ae" }}></i>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", margin: "0 0 2px" }}>
                        Email Verification
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                        Code will be sent to{" "}
                        <strong style={{ color: "#1252ae", fontWeight: 700 }}>{details.email || "—"}</strong>
                      </p>
                    </div>
                  </div>
                  {/* Button area */}
                  <div style={{ padding: "14px 16px", background: "#ffffff" }}>
                    <button
                      type="button"
                      className="btn-wizard-next"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={sendOtp}
                      disabled={busy || !details.email}
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                      {busy ? "Sending Code…" : "Send Verification Code"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  background: "#fafbfc",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "0.75rem", fontWeight: 700, marginBottom: "12px" }}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Code sent to <strong style={{ color: "#0f172a" }}>{details.email}</strong></span>
                  </div>
                  <label className="form-label">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control"
                    style={{ textAlign: "center", fontFamily: "monospace", fontSize: "1.5rem", letterSpacing: "0.4em", fontWeight: 700 }}
                    placeholder="· · · · · ·"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "10px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Didn&apos;t receive it?</span>
                    <button
                      type="button"
                      style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1252ae", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                      onClick={sendOtp}
                      disabled={busy}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "12px" }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: "9px", color: "#cbd5e1" }}></i>
                <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>256-bit encrypted &middot; Your data is never shared</span>
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

            {step < 3 ? (
              <button
                type="button"
                className="btn-wizard-next"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
              >
                Continue{" "}
                <i
                  className="fa-solid fa-arrow-right"
                  style={{ fontSize: "0.85rem" }}
                ></i>
              </button>
            ) : (
              <button
                type="button"
                className="btn-wizard-next"
                onClick={submit}
                disabled={busy || !otpSent || code.length !== 6}
              >
                {busy ? "Submitting Application…" : "Complete Registration"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function UploadBox({
  label,
  sublabel,
  icon,
  done,
  onPick,
}: {
  label: string;
  sublabel?: string;
  icon?: string;
  done: boolean;
  onPick: (f?: File) => void;
}) {
  const [selectedName, setSelectedName] = useState<string | null>(null);

  return (
    <div className="search-group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="form-label mb-0">{label}</label>
        {done && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-xs"></i> Ready
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
                <i className="fa-solid fa-paperclip text-xs"></i> {selectedName || "File Attached ✓"}
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
            const file = e.target.files?.[0];
            if (file) setSelectedName(file.name);
            onPick(file);
          }}
        />
      </div>
    </div>
  );
}
