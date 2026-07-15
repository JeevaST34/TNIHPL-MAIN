"use client";

import { useEffect, useState } from "react";
import { api, type Hostel } from "@/lib/api";
import HostelCard from "./HostelCard";

// Shown when the API is unreachable (e.g. during static preview) so the page still looks complete.
const FALLBACK: Hostel[] = [
  {
    id: "s1",
    name: "TNIHPL Residency, Guindy",
    code: "—",
    locationName: "Chennai",
    description: null,
    displayInWebsite: true,
    soldOut: false,
    amenityIds: [],
  },
  {
    id: "s2",
    name: "TNIHPL Stay, Coimbatore",
    code: "—",
    locationName: "Coimbatore",
    description: null,
    displayInWebsite: true,
    soldOut: false,
    amenityIds: [],
  },
  {
    id: "s3",
    name: "TNIHPL Hostel, Madurai",
    code: "—",
    locationName: "Madurai",
    description: null,
    displayInWebsite: true,
    soldOut: true,
    amenityIds: [],
  },
];

const getHostelImage = (hostel: Hostel) => {
  const name = hostel.name.toLowerCase();

  if (name.includes("guindy")) {
    return "/images/image_2.png";
  }

  if (name.includes("coimbatore")) {
    return "/images/image_3.png";
  }

  if (name.includes("madurai")) {
    return "/images/image_4.png";
  }

  return "/images/image_6.png";
};

export default function FeaturedStays() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .websiteHostels()
      .then((data) => setHostels(data.length ? data : FALLBACK))
      .catch(() => setHostels(FALLBACK))
      .finally(() => setLoaded(true));
  }, []);

  const list = (loaded ? hostels : FALLBACK).slice(0, 6);

  return (
    <section id="stays" className="section-white">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">POPULAR PROPERTIES</span>
          <h2 className="section-title">Featured Stays Across Tamil Nadu</h2>
          <p className="section-desc">
            Explore our top-rated, fully-equipped hostels in prime locations across major cities.
          </p>
        </div>

        <div className="property-grid">
          {list.map((h, i) => (
            <HostelCard
              key={h.id}
              hostel={h}
              featured={i === 0}
              image={getHostelImage(h)}
            />
          ))}
        </div>

        <div className="text-center" style={{ marginTop: "36px" }}>
          <a href="#contact-inquiry" className="btn-explore-all">
            Can&apos;t decide? Talk to us &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
