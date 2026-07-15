import Link from "next/link";
import type { Hostel } from "@/lib/api";

export default function HostelCard({
  hostel,
  featured,
  image,
}: {
  hostel: Hostel;
  featured?: boolean;
  image: string;
}) {
  return (
    <div className="property-card estato-card">
      <div className="card-img-wrapper">
        <img src={image} alt={hostel.name} className="card-img" />
        <div className="card-top-badges">
          <span className="etag etag-type">{featured ? "Featured" : "Student"}</span>
          {hostel.soldOut ? (
            <span className="etag etag-status etag-sold">Sold Out</span>
          ) : (
            <span className="etag etag-status etag-available">Available</span>
          )}
        </div>
        <button type="button" className="btn-wishlist card-badge-right" aria-label="Save Property">
          <i className="fa-regular fa-heart"></i>
        </button>
        <div className="card-time-badge">
          <i className="fa-solid fa-clock"></i> Verified
        </div>
      </div>
      <div className="card-body">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
          <span className="card-agent">
            <i className="fa-solid fa-circle-user mr-1" style={{ color: "var(--primary-color)" }}></i> By TNIHPL Manager
          </span>
          <span className="card-rating text-amber-500 font-bold">★★★★★ <em className="text-slate-400 font-normal">(4.8)</em></span>
        </div>

        <div className="card-info-block">
          <h3 className="card-title" style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-dark)" }}>
            {hostel.name}
          </h3>
          <div className="card-location" style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            <i className="fa-solid fa-location-dot" style={{ color: "var(--primary-color)", marginRight: "4px" }}></i>
            {hostel.locationName ?? "Tamil Nadu"}
          </div>
          <div className="card-price-block flex items-center justify-between" style={{ marginTop: "4px" }}>
            <span className="card-price-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600, color: "var(--text-muted)" }}>Start From</span>
            <span className="card-price-value" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-color)" }}>₹6,500<small style={{ fontSize: "0.75rem", fontWeight: 500 }}>/mo</small></span>
          </div>
        </div>

        <hr className="card-divider" />
        <div className="card-specs-row mb-3">
          <span className="card-spec"><i className="fa-solid fa-bed"></i> 1/2/3 Sharing</span>
          <span className="card-spec"><i className="fa-solid fa-wifi"></i> Free Wi-Fi</span>
          <span className="card-spec"><i className="fa-solid fa-utensils"></i> Meals</span>
        </div>
        <Link href="/book" className="btn-card-action">
          Book Stay &rarr;
        </Link>
      </div>
    </div>
  );
}
