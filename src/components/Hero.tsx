"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("monthly");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [stayType, setStayType] = useState("Monthly");
  const [guests, setGuests] = useState("1");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (stayType) params.set("stayType", stayType);
    if (guests) params.set("guests", guests);
    router.push(`/book?${params.toString()}`);
  }

  return (
    <section id="home" className="hero">
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-content">
          <span className="hero-pill">
            • TRUSTED HOSTELS ACROSS TAMIL NADU
          </span>
          <h1 className="hero-title">
            Find a stay that feels like <span className="shimmer-text">home.</span>
          </h1>
          <p className="hero-desc">
            Verified hostels, transparent pricing and a booking experience built
            for comfort, safety and active student communities.
          </p>

          <div className="hero-cta-row">
            <Link href="/book" className="btn-hero-primary">
              Book a Stay
            </Link>
            <a href="#stays" className="btn-hero-ghost">
              Browse Hostels
            </a>
          </div>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="resident" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="resident" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" alt="resident" />
            </div>
            <span className="hero-proof-text">
              <strong>8,000+</strong> satisfied residents across Tamil Nadu
            </span>
          </div>
        </div>

        {/* Horizontal Search Box Widget */}
        <div className="search-widget">
          <div className="search-tabs">
            <button
              type="button"
              className={`search-tab-btn ${activeTab === "monthly" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("monthly");
                setStayType("Monthly");
              }}
            >
              Monthly Stay
            </button>
            <button
              type="button"
              className={`search-tab-btn ${activeTab === "short" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("short");
                setStayType("Short stay");
              }}
            >
              Short Stay
            </button>
            <button
              type="button"
              className={`search-tab-btn ${activeTab === "corporate" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("corporate");
                setStayType("Corporate");
              }}
            >
              Corporate
            </button>
          </div>

          <form onSubmit={search} className="search-form-grid" id="main-search-form">
            <div className="search-group">
              <label className="search-label">LOCATION</label>
              <select
                className="search-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Choose city</option>
                <option value="chennai">Chennai</option>
                <option value="coimbatore">Coimbatore</option>
                <option value="madurai">Madurai</option>
              </select>
            </div>

            <div className="search-group">
              <label className="search-label">CHECK-IN</label>
              <input
                type="date"
                className="search-input"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="search-group">
              <label className="search-label">STAY TYPE</label>
              <select
                className="search-select"
                value={stayType}
                onChange={(e) => setStayType(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Short stay">Short stay</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div className="search-group">
              <label className="search-label">GUESTS</label>
              <select
                className="search-select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
              </select>
            </div>

            <button type="submit" className="btn-search">
              <i className="fa-solid fa-magnifying-glass"></i> Search Stays
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
