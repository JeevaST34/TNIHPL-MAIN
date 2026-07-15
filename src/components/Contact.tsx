"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", preferredLocation: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api.submitPreBooking(form);
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", preferredLocation: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="section-white" id="contact-inquiry">
      <div className="container">
        <div data-aos="fade-up">
          <span className="section-pill">Contact Us Today</span>
          <h2 className="mt-2" style={{ fontSize: "2rem", fontWeight: 800 }}>Let&apos;s Connect</h2>
          <p className="text-muted mt-2" style={{ maxWidth: "480px", fontSize: "var(--font-sm)" }}>
            Whether you&apos;re enrolling, relocating, or just exploring options, we&apos;re here to help. Get expert advice and seamless hostel bookings.
          </p>
        </div>
        <div className="lets-connect-grid mt-4">
          {/* LEFT: Form */}
          <div className="lc-form-wrap" data-aos="fade-right" data-aos-duration="800">
            {status === "sent" ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-800 font-medium">
                <i className="fa-solid fa-circle-check text-emerald-600 mr-2"></i>
                Thanks! We&apos;ve received your message and will be in touch shortly.
              </div>
            ) : (
              <form onSubmit={submit} className="lc-form">
                <div className="lc-form-row">
                  <input
                    type="text"
                    className="lc-input"
                    placeholder="Your Name*"
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  <input
                    type="email"
                    className="lc-input"
                    placeholder="Your Email*"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="lc-form-row">
                  <input
                    type="tel"
                    className="lc-input"
                    placeholder="Your Phone*"
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                  <input
                    type="text"
                    className="lc-input"
                    placeholder="Preferred City*"
                    value={form.preferredLocation}
                    onChange={(e) => set("preferredLocation", e.target.value)}
                  />
                </div>
                <textarea
                  className="lc-input lc-textarea"
                  rows={5}
                  placeholder="Message..."
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
                {status === "error" && (
                  <p className="text-sm font-semibold text-rose-600">{error}</p>
                )}
                <button
                  type="submit"
                  className="btn-lc-send"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Dark info card with image bg */}
          <div
            className="lc-info-card"
            data-aos="fade-left"
            data-aos-duration="800"
            style={{ backgroundImage: "url('/images/image_5.png')" }}
          >
            <div className="lc-info-overlay">
              <h3 className="lc-info-title">Contact Info</h3>
              <div className="lc-info-block">
                <h5>Our Location</h5>
                <p>TNIHPL Offices, Chennai, Tamil Nadu, India — 600 032</p>
              </div>
              <div className="lc-info-block">
                <h5>Quick Contact</h5>
                <p>Email: hello@tnihpl.example</p>
                <p>Call Us: +91 (000) 000-0000</p>
              </div>
              <Link href="/book" className="btn-lc-contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
