"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CorporatePortalHeader, {
  CorporatePortalSubnav,
} from "@/components/CorporatePortalHeader";
import { Footer } from "@/components/StaticSections";
import { corporatePortal, getToken, type CompanyAnnouncement } from "@/lib/corporate-portal";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

export default function CorporateAnnouncementsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CompanyAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal-corporate/login");
      return;
    }
    (async () => {
      try {
        setItems(await corporatePortal.announcements());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load announcements.");
        if (!getToken()) router.replace("/portal-corporate/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <CorporatePortalHeader />

      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-newspaper"></i> CORPORATE NEWS
              </span>
              <h1 className="breadcrumbs-title">News &amp; Announcements</h1>
              <p className="hero-subtitle-text">
                Important updates, circulars, maintenance schedules &amp;
                notices from hostel operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CorporatePortalSubnav />

      <div className="portal-section-wrapper">
        <div className="container max-w-4xl mx-auto">
          {loading ? (
            <div className="portal-card text-center" style={{ padding: "40px 24px" }}>
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
              Loading announcements…
            </div>
          ) : error ? (
            <div className="portal-card" style={{ borderLeft: "4px solid var(--danger-color)", color: "var(--danger-color)" }}>
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="portal-card text-center text-slate-500" style={{ padding: "60px 24px" }}>
              <i className="fa-solid fa-envelope-open-text text-4xl mb-3 text-slate-400 block"></i>
              No active announcements right now. Check back later for operational updates.
            </div>
          ) : (
            <div className="portal-news-list">
              {items.map((a) => (
                <div key={a.id} className="news-item-card">
                  <div className="news-item-meta">
                    {a.category && a.category.toLowerCase().includes("maint") ? (
                      <span className="badge-maint-tag">
                        <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                        {a.category}
                      </span>
                    ) : (
                      <span className="badge-announce-tag">
                        <i className="fa-solid fa-bullhorn mr-1"></i>
                        {a.category ?? "Notice"}
                      </span>
                    )}
                    <span className="news-item-date">{fmt(a.publishedAt)}</span>
                  </div>
                  <h3 className="news-item-title">{a.title}</h3>
                  <p className="news-item-text whitespace-pre-line leading-relaxed">{a.body}</p>
                  <i className="fa-solid fa-chevron-right news-item-arrow"></i>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
