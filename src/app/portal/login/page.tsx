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
      <div className="login-container">
        {/* LEFT: Form Column */}
        <div className="login-form-col">
          <Link href="/" className="btn-back-home">
            <i className="fa-solid fa-arrow-left"></i> Back To Home
          </Link>

          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-color)", marginBottom: "8px" }}>
            RESIDENT PORTAL
          </div>

          {step === "email" ? (
            <form onSubmit={sendCode}>
              <h1 className="login-title" style={{ marginBottom: "6px" }}>Welcome back</h1>
              <p className="login-subtitle" style={{ marginBottom: "24px" }}>
                Sign in to manage your stay, bills and requests.
              </p>

              <div className="login-field" style={{ marginBottom: "8px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "8px" }}>
                  EMAIL ADDRESS
                </label>
                <div className="login-input-wrap">
                  <input
                    type="email"
                    className="login-input"
                    placeholder="you@example.com"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
                Use the email from your approved booking — we&apos;ll send a 6-digit code.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-signin-submit" disabled={busy || !email}>
                {busy ? "Sending Code…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={signIn}>
              <h1 className="login-title" style={{ marginBottom: "6px" }}>Enter your code</h1>
              <p className="login-subtitle" style={{ marginBottom: "24px" }}>
                We sent a 6-digit verification code to <strong>{email}</strong>.
              </p>

              <div className="login-field" style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "8px" }}>
                  VERIFICATION CODE
                </label>
                <div className="login-input-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="login-input text-center tracking-widest font-mono text-xl"
                    placeholder="••••••"
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-signin-submit" disabled={busy || code.length !== 6}>
                {busy ? "Signing in…" : "Sign in to Dashboard"}
              </button>

              <button
                type="button"
                className="btn-different-email"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
              >
                <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.8rem" }}></i> Use a different email
              </button>
            </form>
          )}

          <div className="login-register-footer" style={{ marginTop: "24px", textAlign: "left" }}>
            Not a resident yet?{" "}
            <Link href="/book" style={{ color: "var(--accent-color)", fontWeight: 700, textDecoration: "none" }}>
              Book a stay
            </Link>
          </div>
        </div>

        {/* RIGHT: Visual Image Column with Overlay Badge */}
        <div className="login-banner-col">
          <Image
            src="/images/image_6.png"
            alt="TNIHPL Premium Living Space"
            width={600}
            height={600}
            className="login-banner-img object-cover w-full h-full"
          />
          <div className="login-banner-badge">
            <div className="badge-seal-icon">
              <i className="fa-solid fa-house-chimney"></i>
            </div>
            <div className="badge-seal-text">
              TRUSTED BY CLIENTS<br />
              <small style={{ fontWeight: 400, opacity: 0.8 }}>TNIHPL HOSTELS</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
