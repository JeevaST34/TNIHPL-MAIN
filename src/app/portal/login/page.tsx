"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resident } from "@/lib/resident";

export default function ResidentLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await resident.sendOtp(email);
      setStep("code");
    } catch {
      setError("Could not send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await resident.login(email, code);
      router.push("/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page-section">
      <div className="login-card-wrap">
        {/* LEFT PANEL: Visual Card */}
        <div className="login-visual-card">
          {/* Background Image & Ambient Overlay */}
          <Image
            src="/images/image_6.png"
            alt="TNIHPL Living Space"
            fill
            className="login-visual-bg"
            priority
          />
          <div className="login-visual-overlay" />

          {/* Bottom Headline & Carousel Indicators inside Left Card */}
          <div className="login-visual-bottom">
            <h2 className="login-visual-title">
              Comfortable, Secure &amp; Active Student Living
            </h2>
            <p className="login-visual-desc">
              Verified hostel stays across Tamil Nadu. Access your portal to
              manage stay, bills &amp; service requests.
            </p>

            {/* Slide Indicators */}
            <div className="login-dots">
              <span className="login-dot-active"></span>
              <span className="login-dot"></span>
              <span className="login-dot"></span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form Area with Logo & Back Navigation */}
        <div className="login-form-area">
          <div className="login-form-box">
            {/* Top Header Bar: Swapped order - Back Navigation on Left, Logo on Right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px",
              }}
            >
              <Link href="/" className="login-btn-back">
                <i
                  className="fa-solid fa-arrow-left"
                  style={{ fontSize: "10px" }}
                ></i>{" "}
                Back to Home
              </Link>

              <Link
                href="/"
                className="inline-block transition-transform hover:scale-105"
              >
                <img
                  src="/images/logo.png"
                  alt="TNIHPL Logo"
                  style={{
                    height: "38px",
                    width: "auto",
                    objectFit: "contain",
                    filter: "none",
                  }}
                />
              </Link>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <span className="login-badge-pill">Resident Portal</span>
              <h1 className="login-form-title">
                {step === "email" ? "Welcome back" : "Enter your code"}
              </h1>
              <p className="login-form-sub">
                {step === "email"
                  ? "Sign in to manage your stay, bills, and requests."
                  : `We sent a 6-digit verification code to ${email}.`}
              </p>
            </div>

            {step === "email" ? (
              <form onSubmit={sendCode}>
                <div style={{ marginBottom: "20px" }}>
                  <label className="login-input-label">Email Address</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="login-styled-input"
                  />
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.75rem",
                      marginTop: "8px",
                    }}
                  >
                    Use the email from your approved booking — we&apos;ll send a
                    6-digit code.
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      color: "#fb7185",
                      fontSize: "0.8rem",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || !email}
                  className="login-btn-primary"
                >
                  {busy ? "Sending Code…" : "Send code"}
                </button>
              </form>
            ) : (
              <form onSubmit={signIn}>
                <div style={{ marginBottom: "20px" }}>
                  <label className="login-input-label">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="login-styled-input"
                    style={{
                      textAlign: "center",
                      fontFamily: "monospace",
                      fontSize: "1.4rem",
                      letterSpacing: "0.4em",
                    }}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      color: "#fb7185",
                      fontSize: "0.8rem",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="login-btn-primary"
                >
                  {busy ? "Signing in…" : "Sign in to Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#94a3b8",
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    marginTop: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <i
                    className="fa-solid fa-arrow-left"
                    style={{ fontSize: "10px" }}
                  ></i>{" "}
                  Use a different email
                </button>
              </form>
            )}

            <div className="login-footer-text">
              Not a resident yet? <Link href="/book">Book a stay</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
