"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CorporatePortalHeader, {
  CorporatePortalSubnav,
} from "@/components/CorporatePortalHeader";
import { Footer } from "@/components/StaticSections";
import {
  corporatePortal,
  getToken,
  RESERVATION_STATUS,
  type CompanyProfile,
  type CompanyAnnouncement,
} from "@/lib/corporate-portal";

const QUICK_LINKS = [
  { href: "/portal-corporate/bills", title: "Bills & Payments", desc: "View invoices, pay online & track payment receipts", icon: "fa-solid fa-file-invoice-dollar" },
  { href: "/portal-corporate/requests", title: "Service Requests", desc: "Raise maintenance tickets for any of your rooms", icon: "fa-solid fa-headset" },
  { href: "/portal-corporate/announcements", title: "Announcements", desc: "Latest news and updates from your hostel", icon: "fa-solid fa-newspaper" },
];

export default function CorporatePortalHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [announcements, setAnnouncements] = useState<CompanyAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal-corporate/login");
      return;
    }
    (async () => {
      try {
        const [p, a] = await Promise.allSettled([
          corporatePortal.profile(),
          corporatePortal.announcements(),
        ]);
        if (p.status === "fulfilled") setProfile(p.value);
        else throw p.reason;
        if (a.status === "fulfilled") setAnnouncements(a.value);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your details.");
        if (!getToken()) router.replace("/portal-corporate/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <main className="min-h-screen bg-slate-50">
      <CorporatePortalHeader />

      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-building"></i> CORPORATE PORTAL
              </span>
              <h1 className="breadcrumbs-title">
                Welcome{profile ? `, ${profile.companyName}` : ""}
              </h1>
              <p className="hero-subtitle-text">
                Track your booking approval, manage bills, and raise requests
                for your employees&apos; rooms.
              </p>
              <div className="hero-actions-row">
                <Link href="/portal-corporate/requests" className="hero-btn-primary">
                  <i className="fa-solid fa-headset text-primary mr-1"></i> Raise a Request
                </Link>
                <div className="hero-ratings-pill">
                  <i className="fa-solid fa-circle-check text-emerald-500 mr-1"></i>
                  <span>
                    <strong>
                      {profile?.status
                        ? RESERVATION_STATUS[profile.status]
                        : "No booking yet"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="hero-split-right">
              <div className="hero-showcase-frame">
                <Image
                  src="/images/image_5.jpeg"
                  alt="Corporate Dashboard"
                  width={500}
                  height={320}
                  className="hero-showcase-img"
                />
              </div>
              <div className="floating-hero-badge badge-top">
                <i className="fa-solid fa-bed text-amber-500 mr-1"></i>{" "}
                {profile?.occupiedBeds ?? 0}/{profile?.totalBeds ?? 0} Beds
              </div>
              <div className="floating-hero-badge badge-bottom">
                <i className="fa-solid fa-file-contract text-amber-500 mr-1"></i>{" "}
                {profile?.reservationCode ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CorporatePortalSubnav />

      <div className="portal-section-wrapper">
        <div className="container">
          {loading ? (
            <div className="portal-card text-center" style={{ padding: "40px 24px" }}>
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
              Loading your corporate dashboard…
            </div>
          ) : error ? (
            <div
              className="portal-card"
              style={{ borderLeft: "4px solid var(--danger-color)", color: "var(--danger-color)" }}
            >
              {error}
            </div>
          ) : (
            <>
              {announcements.length > 0 && (
                <div className="portal-announcement-banner">
                  <div className="announcement-left">
                    <div className="announcement-eyebrow">
                      <i className="fa-solid fa-bullhorn"></i> Latest Announcement
                      {announcements[0].category && ` • ${announcements[0].category}`}
                    </div>
                    <h3 className="announcement-heading">{announcements[0].title}</h3>
                    <p className="announcement-body">{announcements[0].body}</p>
                  </div>
                  <Link href="/portal-corporate/announcements" className="announcement-cta">
                    View all &nbsp;<i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              )}

              <div className="portal-card">
                <div className="portal-card-title">
                  <i className="fa-solid fa-id-badge"></i> Booking Details
                </div>

                <div className="resident-status-strip">
                  <span className="status-tag status-tag-reserved">
                    {profile?.status
                      ? RESERVATION_STATUS[profile.status]
                      : "Not yet booked"}
                  </span>
                  <span className="resident-booking-id">
                    REF: {profile?.reservationCode ?? "—"}
                  </span>
                </div>

                <div className="resident-info-grid">
                  <div className="info-tile">
                    <span className="info-tile-label">Total Beds</span>
                    <span className="info-tile-value">{profile?.totalBeds ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Occupied Beds</span>
                    <span className="info-tile-value">{profile?.occupiedBeds ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Agreement Expiry</span>
                    <span className="info-tile-value">
                      {fmt(profile?.agreementExpiryDate ?? null)}
                    </span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Contact Person</span>
                    <span className="info-tile-value">{profile?.contactName ?? "—"}</span>
                  </div>
                </div>

                <div className="portal-section-divider"></div>

                <div className="resident-info-grid">
                  <div className="info-tile">
                    <span className="info-tile-label">Company Name</span>
                    <span className="info-tile-value">{profile?.companyName ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Registered Email</span>
                    <span className="info-tile-value">{profile?.email ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Contact Number</span>
                    <span className="info-tile-value">{profile?.mobile ?? "—"}</span>
                  </div>
                </div>
              </div>

              <div className="portal-actions-grid">
                {QUICK_LINKS.map((q) => (
                  <Link key={q.href} href={q.href} className="portal-action-tile">
                    <div className="action-icon-box">
                      <i className={q.icon}></i>
                    </div>
                    <div className="action-tile-body">
                      <h4 className="action-tile-title">{q.title}</h4>
                      <p className="action-tile-desc">{q.desc}</p>
                    </div>
                    <div className="action-tile-chevron">
                      <i className="fa-solid fa-chevron-right"></i>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
