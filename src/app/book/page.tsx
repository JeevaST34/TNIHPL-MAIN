"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/StaticSections";
import IndividualForm from "./IndividualForm";
import CorporateForm from "./CorporateForm";

type BookingType = "Individual" | "Corporate";

export default function BookPage() {
  const [bookingType, setBookingType] = useState<BookingType>("Individual");

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
        <div className="container" style={{ padding: "40px 16px" }}>
          <div style={{ maxWidth: "340px", margin: "0 auto 36px", textAlign: "center" }}>
            <div
              className="p-1 bg-slate-200/80 backdrop-blur-sm rounded-xl border border-slate-300/60 shadow-inner"
              style={{ display: "flex", gap: "6px", padding: "5px", background: "#e2e8f0", borderRadius: "14px" }}
            >
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                  bookingType === "Individual"
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                  backgroundColor: bookingType === "Individual" ? "#ffffff" : "transparent",
                  color: bookingType === "Individual" ? "#1252ae" : "#64748b",
                  boxShadow: bookingType === "Individual" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={() => setBookingType("Individual")}
              >
                <i className={`fa-solid fa-user ${bookingType === "Individual" ? "text-blue-600" : "text-slate-400"}`} style={{ color: bookingType === "Individual" ? "#1252ae" : "#94a3b8" }}></i>
                <span>Individual</span>
              </button>

              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                  bookingType === "Corporate"
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                  backgroundColor: bookingType === "Corporate" ? "#ffffff" : "transparent",
                  color: bookingType === "Corporate" ? "#1252ae" : "#64748b",
                  boxShadow: bookingType === "Corporate" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={() => setBookingType("Corporate")}
              >
                <i className={`fa-solid fa-building ${bookingType === "Corporate" ? "text-blue-600" : "text-slate-400"}`} style={{ color: bookingType === "Corporate" ? "#1252ae" : "#94a3b8" }}></i>
                <span>Corporate</span>
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "8px", textAlign: "center" }}>
              {bookingType === "Individual"
                ? "For single occupants, students & working professionals"
                : "For employers & corporate workforce bed reservations"}
            </p>
          </div>

          {bookingType === "Individual" ? (
            <Suspense fallback={null}>
              <IndividualForm />
            </Suspense>
          ) : (
            <CorporateForm />
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
