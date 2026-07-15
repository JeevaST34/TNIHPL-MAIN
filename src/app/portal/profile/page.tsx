"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PortalHeader, { PortalSubnav } from "@/components/PortalHeader";
import { Footer } from "@/components/StaticSections";
import {
  resident,
  getToken,
  type ResidentFoodPreference,
  type ResidentDocument,
  type ResidentReview,
  type FeedbackRatings,
} from "@/lib/resident";

const RATING_FIELDS: { key: keyof FeedbackRatings; label: string }[] = [
  { key: "safetySecurity", label: "Safety & security" },
  { key: "hygiene", label: "Hygiene" },
  { key: "amenities", label: "Amenities" },
  { key: "staffBehaviour", label: "Staff behaviour" },
  { key: "foodQuality", label: "Food quality" },
  { key: "overall", label: "Overall" },
];

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: "1.25rem",
            color: n <= value ? "var(--color-rating)" : "var(--border-color)"
          }}
          aria-label={`${n} star`}
        >
          <i className={n <= value ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
        </button>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // food preference
  const [food, setFood] = useState<ResidentFoodPreference>({ foodOpted: false, mealType: "", mealTime: "" });
  const [foodSaving, setFoodSaving] = useState(false);
  const [foodMsg, setFoodMsg] = useState("");

  // documents
  const [docs, setDocs] = useState<ResidentDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [docMsg, setDocMsg] = useState("");
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // feedback
  const [ratings, setRatings] = useState<FeedbackRatings>({ safetySecurity: 0, hygiene: 0, amenities: 0, staffBehaviour: 0, foodQuality: 0, overall: 0 });
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  // review
  const [reviews, setReviews] = useState<ResidentReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  async function loadDocs() {
    setDocs(await resident.documents());
  }
  async function loadReviews() {
    setReviews(await resident.reviews());
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/portal/login");
      return;
    }
    (async () => {
      try {
        const [f, d, r] = await Promise.all([resident.foodPreference(), resident.documents(), resident.reviews()]);
        setFood({ foodOpted: f.foodOpted, mealType: f.mealType ?? "", mealTime: f.mealTime ?? "" });
        setDocs(d);
        setReviews(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your profile.");
        if (!getToken()) router.replace("/portal/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function saveFood(e: React.FormEvent) {
    e.preventDefault();
    setFoodSaving(true);
    setFoodMsg("");
    try {
      await resident.updateFoodPreference({ foodOpted: food.foodOpted, mealType: food.mealType || null, mealTime: food.mealTime || null });
      setFoodMsg("Saved.");
    } catch (err) {
      setFoodMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setFoodSaving(false);
    }
  }

  async function upload(kind: string, file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    setDocMsg("");
    try {
      await resident.uploadDocument(kind, file);
      await loadDocs();
      setDocMsg("Uploaded.");
    } catch (err) {
      setDocMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function view(kind: string) {
    try {
      const url = await resident.documentUrl(kind);
      window.open(url, "_blank");
    } catch (err) {
      setDocMsg(err instanceof Error ? err.message : "Could not open the document.");
    }
  }

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (RATING_FIELDS.some((f) => ratings[f.key] < 1)) {
      setFeedbackMsg("Please rate every category.");
      return;
    }
    setFeedbackSaving(true);
    setFeedbackMsg("");
    try {
      await resident.submitFeedback({ feedbackType: "Resident portal", monthYear: null, ratings });
      setFeedbackMsg("Thank you for your feedback!");
      setRatings({ safetySecurity: 0, hygiene: 0, amenities: 0, staffBehaviour: 0, foodQuality: 0, overall: 0 });
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : "Could not submit feedback.");
    } finally {
      setFeedbackSaving(false);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewSaving(true);
    setReviewMsg("");
    try {
      await resident.submitReview(reviewText.trim());
      setReviewText("");
      setReviewMsg("Thanks! Your review will appear once our team approves it.");
      await loadReviews();
    } catch (err) {
      setReviewMsg(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setReviewSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PortalHeader />

      <div className="breadcrumbs-header">
        <div className="container">
          <div className="hero-split-wrap">
            <div className="hero-split-left">
              <span className="hero-tag-badge">
                <i className="fa-solid fa-id-card"></i> RESIDENT PROFILE
              </span>
              <h1 className="breadcrumbs-title">My Profile &amp; Preferences</h1>
              <p className="hero-subtitle-text">
                Manage meal choices, update identification documents &amp; rate your stay experience.
              </p>
            </div>
          </div>
        </div>
      </div>
      <PortalSubnav />
      <div className="portal-section-wrapper">
        <div className="container max-w-4xl mx-auto">
          {loading ? (
            <div className="portal-card text-center" style={{ padding: "40px 24px" }}>
              <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-2 block"></i>
              Loading profile preferences…
            </div>
          ) : error ? (
            <div className="portal-card" style={{ borderLeft: "4px solid var(--danger-color)", color: "var(--danger-color)" }}>
              {error}
            </div>
          ) : (
            <>
              {/* Food Preference */}
              <div className="portal-card">
                <div className="portal-card-title">
                  <i className="fa-solid fa-utensils"></i> Food &amp; Meal Preferences
                </div>
                <form onSubmit={saveFood}>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "14px 20px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>
                    <input
                      type="checkbox"
                      checked={food.foodOpted}
                      onChange={(e) => setFood({ ...food, foodOpted: e.target.checked })}
                      style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)", cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: 600, color: "var(--secondary-color)", fontSize: "var(--font-sm)" }}>I would like daily meals provided</span>
                  </label>

                  {food.foodOpted && (
                    <div className="form-grid-2" style={{ marginBottom: "20px" }}>
                      <div className="portal-form-group">
                        <label className="portal-form-label">Meal Type</label>
                        <input
                          value={food.mealType ?? ""}
                          onChange={(e) => setFood({ ...food, mealType: e.target.value })}
                          placeholder="e.g. Vegetarian, Non-veg"
                          className="portal-form-control"
                        />
                      </div>
                      <div className="portal-form-group">
                        <label className="portal-form-label">Meal Timing / Preference</label>
                        <input
                          value={food.mealTime ?? ""}
                          onChange={(e) => setFood({ ...food, mealTime: e.target.value })}
                          placeholder="e.g. Breakfast &amp; Dinner"
                          className="portal-form-control"
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button type="submit" disabled={foodSaving} className="btn-portal-submit" style={{ margin: 0 }}>
                      <i className="fa-solid fa-floppy-disk"></i> {foodSaving ? "Saving…" : "Save Preferences"}
                    </button>
                    {foodMsg && <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-available)" }}>{foodMsg}</span>}
                  </div>
                </form>
              </div>

              {/* Documents */}
              <div className="portal-card">
                <div className="portal-card-title">
                  <i className="fa-solid fa-folder-open"></i> Identity Documents
                </div>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: "20px" }}>Re-upload or update your verification files (JPG, PNG, PDF up to 5 MB).</p>
                {docMsg && <p style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--primary-color)", marginBottom: "16px" }}>{docMsg}</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {docs.map((d) => (
                    <div key={d.kind} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "16px 20px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--secondary-color)", fontSize: "var(--font-sm)" }}>{d.label}</div>
                        <div style={{ fontSize: "var(--font-xs)", color: d.onFile ? "var(--color-available)" : "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>
                          {d.onFile ? "✓ File on record" : "Not uploaded yet"}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {d.onFile && (
                          <button
                            onClick={() => view(d.kind)}
                            className="btn-portal-submit"
                            style={{ margin: 0, padding: "8px 16px", fontSize: "var(--font-xs)", background: "transparent", color: "var(--secondary-color)", border: "1px solid var(--border-color)" }}
                          >
                            View Document
                          </button>
                        )}
                        <input
                          ref={(el) => { fileInputs.current[d.kind] = el; }}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={(e) => upload(d.kind, e.target.files?.[0])}
                        />
                        <button
                          onClick={() => fileInputs.current[d.kind]?.click()}
                          disabled={uploading === d.kind}
                          className="btn-portal-submit"
                          style={{ margin: 0, padding: "8px 16px", fontSize: "var(--font-xs)" }}
                        >
                          {uploading === d.kind ? "Uploading…" : d.onFile ? "Replace File" : "Upload File"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Ratings */}
              <div className="portal-card">
                <div className="portal-card-title">
                  <i className="fa-solid fa-star"></i> Rate Your Stay Experience
                </div>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: "20px" }}>Your ratings help us continuously improve hostel management and amenities.</p>
                <form onSubmit={submitFeedback}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "480px", marginBottom: "20px" }}>
                    {RATING_FIELDS.map((f) => (
                      <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)" }}>
                        <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--secondary-color)" }}>{f.label}</span>
                        <Stars value={ratings[f.key]} onChange={(n) => setRatings({ ...ratings, [f.key]: n })} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button type="submit" disabled={feedbackSaving} className="btn-portal-submit" style={{ margin: 0 }}>
                      <i className="fa-solid fa-paper-plane"></i> {feedbackSaving ? "Submitting…" : "Submit Ratings"}
                    </button>
                    {feedbackMsg && <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-available)" }}>{feedbackMsg}</span>}
                  </div>
                </form>
              </div>

              {/* Write Review */}
              <div className="portal-card">
                <div className="portal-card-title">
                  <i className="fa-solid fa-comment-dots"></i> Write a Resident Review
                </div>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: "20px" }}>Share your testimonial — approved reviews may be featured on our official website.</p>
                <form onSubmit={submitReview}>
                  <div className="portal-form-group">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      maxLength={2000}
                      placeholder="Tell future residents about your stay experience..."
                      className="portal-form-control portal-form-textarea"
                      style={{ marginBottom: "16px" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <button type="submit" disabled={reviewSaving || !reviewText.trim()} className="btn-portal-submit" style={{ margin: 0 }}>
                      <i className="fa-solid fa-paper-plane"></i> {reviewSaving ? "Submitting…" : "Submit Review"}
                    </button>
                    {reviewMsg && <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-available)" }}>{reviewMsg}</span>}
                  </div>

                  {reviews.length > 0 && (
                    <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-color-light)", paddingTop: "24px" }}>
                      <h4 style={{ fontSize: "var(--font-xs)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "16px" }}>Your Past Reviews</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {reviews.map((r) => (
                          <div key={r.id} style={{ padding: "16px", background: "var(--bg-light)", border: "1px solid var(--border-color-light)", borderRadius: "var(--radius-sm)" }}>
                            <p style={{ fontSize: "var(--font-sm)", fontWeight: 500, color: "var(--secondary-color)", margin: 0 }}>{r.reviewText}</p>
                            <p style={{ fontSize: "var(--font-xs)", color: r.showOnWebsite ? "var(--color-available)" : "var(--text-muted)", fontWeight: 600, marginTop: "8px", marginBottom: 0 }}>
                              {r.showOnWebsite ? "✓ Published on website" : "⏳ Under review"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
