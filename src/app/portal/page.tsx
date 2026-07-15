"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalHeader, { PortalSubnav } from "@/components/PortalHeader";
import { Footer } from "@/components/StaticSections";
import {
  resident,
  getToken,
  STAY_STATUS,
  type ResidentProfile,
  type ResidentStay,
  type ResidentAnnouncement,
} from "@/lib/resident";

const STATUS_TONE: Record<number, string> = {
  1: "status-badge status-available",
  2: "status-badge status-available",
  3: "status-badge",
  4: "status-badge status-sold-out",
};

const QUICK_LINKS = [
  { href: "/portal/bills", title: "Bills & Payments", desc: "View invoices, pay online & track payment receipts", icon: "fa-solid fa-file-invoice-dollar" },
  { href: "/portal/requests", title: "Service Requests", desc: "Raise maintenance tickets & track resolution status", icon: "fa-solid fa-headset" },
  { href: "/portal/refunds", title: "Stay & Refunds", desc: "Vacate notice, room change & security deposit refunds", icon: "fa-solid fa-rotate-left" },
  { href: "/portal/profile", title: "Resident Profile", desc: "Update meal choices, documents & submit reviews", icon: "fa-solid fa-id-card" },
];

export default function PortalHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [stay, setStay] = useState<ResidentStay | null>(null);
  const [announcements, setAnnouncements] = useState<ResidentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal/login");
      return;
    }
    (async () => {
      try {
        const [p, s, a] = await Promise.allSettled([resident.profile(), resident.stay(), resident.announcements()]);
        if (p.status === "fulfilled") setProfile(p.value);
        else throw p.reason;
        if (s.status === "fulfilled") setStay(s.value);
        if (a.status === "fulfilled") setAnnouncements(a.value);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your details.");
        if (!getToken()) router.replace("/portal/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <main className="min-h-screen bg-slate-50">
      <PortalHeader />

      {/* Header Banner */}
      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-user-gear"></i> RESIDENT PORTAL
              </span>
              <h1 className="breadcrumbs-title">
                Welcome Back{profile ? `, ${profile.name.split(" ")[0]}` : ""}
              </h1>
              <p className="hero-subtitle-text">
                Manage your stay, raise service requests, track bills &amp; update meal preferences.
              </p>
              <div className="hero-actions-row">
                <Link href="/portal/requests" className="hero-btn-primary">
                  <i className="fa-solid fa-headset text-primary mr-1"></i> Raise a Request
                </Link>
                <div className="hero-ratings-pill">
                  <i className="fa-solid fa-circle-check text-emerald-500 mr-1"></i>
                  <span><strong>Active Resident</strong> &middot; {profile?.name ?? "Resident"}</span>
                </div>
              </div>
            </div>
            <div className="hero-split-right">
              <div className="hero-showcase-frame">
                <Image
                  src="/images/image_5.jpeg"
                  alt="Resident Dashboard"
                  width={500}
                  height={320}
                  className="hero-showcase-img"
                />
              </div>
              <div className="floating-hero-badge badge-top">
                <i className="fa-solid fa-user-check text-amber-500 mr-1"></i> Active Stay
              </div>
              <div className="floating-hero-badge badge-bottom">
                <i className="fa-solid fa-bed text-amber-500 mr-1"></i> Room {stay?.roomNumber ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PortalSubnav />

      <div className="portal-section-wrapper">
        <div className="container">
          {loading ? (
            <div className="portal-card text-center" style={{ padding: "40px 24px" }}>
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
              Loading your resident dashboard…
            </div>
          ) : error ? (
            <div className="portal-card" style={{ borderLeft: "4px solid var(--danger-color)", color: "var(--danger-color)" }}>
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
                  <Link href="/portal/announcements" className="announcement-cta">
                    View all &nbsp;<i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              )}

              {/* Stay Summary Card */}
              <div className="portal-card">
                <div className="portal-card-title">
                  <i className="fa-solid fa-id-badge"></i> Your Booking Details
                </div>
                
                <div className="resident-status-strip">
                  {stay ? (
                    <span className="status-tag status-tag-reserved">
                      {STAY_STATUS[stay.status] ?? "—"}
                    </span>
                  ) : (
                    <span className="status-tag status-tag-reserved">No active stay</span>
                  )}
                  <span className="resident-booking-id">REF: {stay?.bookingId ?? "—"}</span>
                </div>

                <div className="resident-info-grid">
                  <div className="info-tile">
                    <span className="info-tile-label">Check-in Date</span>
                    <span className="info-tile-value">{fmt(stay?.checkIn ?? null)}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Room / Bed</span>
                    <span className="info-tile-value">
                      {stay?.roomNumber ?? "—"}{stay?.bedCode ? ` (${stay.bedCode})` : ""}
                    </span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Hostel Unit</span>
                    <span className="info-tile-value">{stay?.hostelName ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Type of Stay</span>
                    <span className="info-tile-value">{stay?.typeOfStay ?? "—"}</span>
                  </div>
                </div>

                <div className="portal-section-divider"></div>

                <div className="resident-info-grid">
                  <div className="info-tile">
                    <span className="info-tile-label">Resident Name</span>
                    <span className="info-tile-value">{profile?.name ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Registered Email</span>
                    <span className="info-tile-value">{profile?.email ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Contact Number</span>
                    <span className="info-tile-value">{profile?.mobile ?? "—"}</span>
                  </div>
                  <div className="info-tile">
                    <span className="info-tile-label">Check-out Date</span>
                    <span className="info-tile-value">{fmt(stay?.actualCheckOut ?? null)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="portal-actions-grid">
                {QUICK_LINKS.map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="portal-action-tile"
                  >
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
