"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/StaticSections";
import { api, type Hostel } from "@/lib/api";

type Details = {
  name: string;
  email: string;
  mobile: string;
  residentType: string;
  dob: string;
  typeOfStay: string;
  permanentAddress: string;
};

type Docs = {
  recentPhoto?: string;
  addressProof?: string;
  communityCertificate?: string;
  bankPassbook?: string;
};

const STEPS = ["Your details", "Documents", "Choose hostel", "Verify & submit"];

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>({
    name: "",
    email: "",
    mobile: "",
    residentType: "Individual",
    dob: "",
    typeOfStay: "Monthly",
    permanentAddress: "",
  });
  const [docs, setDocs] = useState<Docs>({});
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [hostelsError, setHostelsError] = useState(false);
  const [hostelId, setHostelId] = useState("");
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
      })
      .catch(() => {
        setHostels([]);
        setHostelsError(true);
      });
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
        recentPhoto: docs.recentPhoto ?? null,
        addressProof: docs.addressProof ?? null,
        communityCertificate: docs.communityCertificate ?? null,
        bankPassbook: docs.bankPassbook ?? null,
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

  const canNext =
    (step === 0 && details.name && details.email && details.mobile) ||
    step === 1 ||
    (step === 2 && hostelId) ||
    step === 3;

  return (
    <>
      <Navbar />

      {/* Full-Bleed Modern Split Hero Banner */}
      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-sparkles"></i> ONLINE BOOKING
              </span>
              <h1 className="breadcrumbs-title">Book a Stay</h1>
              <p className="hero-subtitle-text">
                Reserve your bed in minutes with transparent pricing &amp; zero
                hidden fees.
              </p>
              <div className="hero-actions-row">
                <a href="#booking-form" className="hero-btn-primary">
                  <i className="fa-solid fa-file-pen text-primary"></i> Fill
                  Registration Form
                </a>
                <div className="hero-ratings-pill">
                  <i className="fa-solid fa-bolt text-amber-500"></i>
                  <span>
                    <strong>Instant Confirmation</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="hero-split-right">
              <div className="hero-showcase-frame">
                <Image
                  src="/images/image_6.png"
                  alt="Hostel Booking Showcase"
                  width={500}
                  height={320}
                  className="hero-showcase-img"
                />
              </div>
              <div className="floating-hero-badge badge-top">
                <i className="fa-solid fa-bolt text-amber-500 mr-1"></i> Instant
                Allotment Check
              </div>
              <div className="floating-hero-badge badge-bottom">
                <i className="fa-solid fa-circle-check text-emerald-500 mr-1"></i>{" "}
                Transparent Pricing
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section-light" id="booking-form">
        <div className="container">
          {doneId ? (
            <div className="wizard-card text-center max-w-xl mx-auto py-12 px-6">
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl mb-4">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Booking Request Submitted!
              </h2>
              <p className="text-slate-600 mb-4">
                Thank you, <strong>{details.name}</strong>. Our team will review
                your application and send the confirmation email to{" "}
                <strong>{details.email}</strong>.
              </p>
              <p className="text-xs font-mono text-slate-500 mb-6 bg-slate-100 py-2 px-4 rounded-lg inline-block">
                Reference ID: {doneId}
              </p>
              <div>
                <Link href="/" className="btn-hero-primary inline-block">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="wizard-container">
              {/* Step Progress indicator */}
              <div className="wizard-steps">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`wizard-step ${i === step ? "active" : i < step ? "completed" : ""}`}
                    onClick={() => {
                      if (i < step) setStep(i);
                    }}
                  >
                    <span className="step-num">{i + 1}</span>
                    <span className="step-label">{s}</span>
                  </div>
                ))}
              </div>

              {/* Wizard form card */}
              <div className="wizard-card">
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Step 1: Your details */}
                  {step === 0 && (
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
                            onChange={(e) =>
                              setField("residentType", e.target.value)
                            }
                          >
                            <option value="Individual">Individual</option>
                            <option value="Student">Student</option>
                            <option value="Working professional">
                              Working professional
                            </option>
                          </select>
                        </div>

                        <div className="search-group">
                          <label className="form-label">Type of Stay</label>
                          <select
                            className="form-control"
                            value={details.typeOfStay}
                            onChange={(e) =>
                              setField("typeOfStay", e.target.value)
                            }
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Short stay">Short stay</option>
                            <option value="Corporate">Corporate</option>
                          </select>
                        </div>

                        <div className="search-group form-group-full">
                          <label className="form-label">
                            Permanent Address
                          </label>
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

                  {/* Step 2: Documents */}
                  {step === 1 && (
                    <div className="wizard-pane active">
                      <h3 className="text-xl font-bold mb-2">
                        Upload Identification Documents
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        Please upload the following files (optional, but speeds
                        up verification and allotment checks). JPG, PNG or PDF.
                      </p>

                      <div className="form-grid">
                        <UploadBox
                          label="Recent Photo"
                          done={!!docs.recentPhoto}
                          onPick={(f) => upload("recentPhoto", f)}
                        />
                        <UploadBox
                          label="Address Proof"
                          sublabel="Aadhaar, driving license, etc."
                          done={!!docs.addressProof}
                          onPick={(f) => upload("addressProof", f)}
                        />
                        <UploadBox
                          label="Community Certificate"
                          done={!!docs.communityCertificate}
                          onPick={(f) => upload("communityCertificate", f)}
                        />
                        <UploadBox
                          label="Bank Passbook"
                          done={!!docs.bankPassbook}
                          onPick={(f) => upload("bankPassbook", f)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Choose hostel */}
                  {step === 2 && (
                    <div className="wizard-pane active">
                      <h3 className="text-xl font-bold mb-2">
                        Select Your Preferred Hostel
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">
                        Choose from our available properties across Tamil Nadu.
                      </p>

                      <div className="search-group">
                        <label className="form-label">
                          Hostel Location &amp; Name *
                        </label>
                        <select
                          className="form-control"
                          value={hostelId}
                          onChange={(e) => setHostelId(e.target.value)}
                        >
                          <option value="">— Select a Hostel —</option>
                          {hostels.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}{" "}
                              {h.locationName ? `(${h.locationName})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      {hostels.length === 0 &&
                        (hostelsError ? (
                          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm mt-4">
                            Couldn&apos;t load hostels list right now. Please
                            refresh or submit enquiry.
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm mt-4">
                            No hostels listed. Please send an enquiry via our
                            contact form.
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Step 4: Verify & submit */}
                  {step === 3 && (
                    <div className="wizard-pane active max-w-lg mx-auto text-center">
                      <h3 className="text-xl font-bold mb-2">
                        Verify Your Email
                      </h3>
                      <p className="text-sm text-slate-600 mb-6">
                        We will send a 6-digit code to{" "}
                        <strong>{details.email}</strong> to verify your identity
                        before final submission.
                      </p>

                      {!otpSent ? (
                        <button
                          type="button"
                          className="btn-lc-send mx-auto block"
                          onClick={sendOtp}
                          disabled={busy || !details.email}
                        >
                          <i className="fa-solid fa-paper-plane mr-2"></i>
                          {busy ? "Sending Code…" : "Send Verification Code"}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="search-group text-left">
                            <label className="form-label">
                              6-Digit Verification Code
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              className="form-control text-center font-mono text-xl tracking-widest"
                              placeholder="123456"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                            />
                          </div>

                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline font-semibold"
                            onClick={sendOtp}
                            disabled={busy}
                          >
                            Resend Verification Code
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Navigation Footer */}
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
                        {busy
                          ? "Submitting Application…"
                          : "Complete Registration"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

function UploadBox({
  label,
  sublabel,
  done,
  onPick,
}: {
  label: string;
  sublabel?: string;
  done: boolean;
  onPick: (f?: File) => void;
}) {
  return (
    <div className="search-group">
      <label className="form-label">{label}</label>
      <div
        className={`upload-drag-area ${done ? "border-emerald-500 bg-emerald-50" : ""}`}
      >
        <span className="upload-icon">{done ? "✅" : "📁"}</span>
        <p className="text-xs text-slate-500 mb-1">
          {sublabel ?? "Upload file"}
        </p>
        <div className="upload-filename font-semibold text-xs text-blue-600">
          {done ? "File attached ✓" : "Click to browse file"}
        </div>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="upload-input-file cursor-pointer"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
