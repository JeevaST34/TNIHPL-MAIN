"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function StatsBar() {
  return (
    <section className="stats-bar">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <h3 className="stat-number">25<span>+</span></h3>
            <p className="stat-label">Verified Hostels</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h3 className="stat-number">2,400<span>+</span></h3>
            <p className="stat-label">Available Beds</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h3 className="stat-number">8,000<span>+</span></h3>
            <p className="stat-label">Satisfied Stays</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h3 className="stat-number">6</h3>
            <p className="stat-label">Cities in TN</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  return (
    <section className="section-light">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">OUR SERVICES</span>
          <h2 className="section-title">Benefits of Staying with Us</h2>
          <p className="section-desc">
            Seamless experience with verified listings, transparent pricing, and a secure booking process built for students and professionals.
          </p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-shield-halved text-2xl"></i></div>
            <h4>Verified Hostels</h4>
            <p>Every property is vetted for safety, cleanliness, hygiene and quality standards before listing.</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-tags text-2xl"></i></div>
            <h4>Best Prices</h4>
            <p>Transparent monthly pricing models with absolutely no hidden fees or extra charges.</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-clock text-2xl"></i></div>
            <h4>Flexible Stay Terms</h4>
            <p>Plans change. Cancel or modify bookings with clear, fair and resident-friendly terms.</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><i className="fa-solid fa-headset text-2xl"></i></div>
            <h4>24/7 Operations</h4>
            <p>On-ground managers and a responsive operations support team always available for you.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BookWithConfidence() {
  return (
    <section className="section-light" id="about">
      <div className="container">
        <div className="two-col-grid">
          {/* Collage Column Left */}
          <div className="feature-collage">
            <img src="/images/image_5.jpeg" alt="Comfortable Hostel Room" className="feature-main-img" />
            <img src="/images/image_2.png" alt="Hostel Living" className="feature-sub-img" />
            <div className="feature-stat-badge">
              <div className="feature-stat-icon">
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div>
                <div className="feature-stat-num">8,000+</div>
                <div className="feature-stat-lbl">Satisfied Stays</div>
              </div>
            </div>
          </div>

          {/* Text Column Right */}
          <div className="two-col-text">
            <span className="section-pill">WHY CHOOSE US</span>
            <h2 className="text-3xl font-bold leading-tight" style={{ fontSize: "2.2rem" }}>
              Book your stay with complete confidence.
            </h2>
            <p className="mt-3 text-muted leading-relaxed" style={{ fontSize: "0.9375rem" }}>
              From secure registration details to check-in assistance, we keep the process simple, safe and completely transparent — so you can settle in comfortably.
            </p>

            <ul className="check-list mt-4 mb-4">
              <li className="check-item">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                <span className="font-medium text-sm">Email OTP verified secure student accounts</span>
              </li>
              <li className="check-item">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                <span className="font-medium text-sm">Itemized digital bills, simple rent payments &amp; invoices</span>
              </li>
              <li className="check-item">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                <span className="font-medium text-sm">Prompt maintenance checks and service tickets via portal</span>
              </li>
            </ul>

            <Link
              href="/book"
              className="btn-nav-solid d-inline-block"
              style={{ width: "fit-content", padding: "14px 32px", borderRadius: "var(--radius-pill)" }}
            >
              Start Booking &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Story() {
  return (
    <section className="section-white">
      <div className="container">
        <div className="two-col-grid">
          <div className="two-col-img">
            <div className="zoom-effect img-rounded">
              <img src="/images/image_6.png" alt="TNIHPL Story" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="two-col-text">
            <span className="section-pill">OUR STORY</span>
            <h2 style={{ fontSize: "2.2rem" }}>Comfortable living, thoughtfully run</h2>
            <p className="mt-3 leading-relaxed">
              TNIHPL operates premium hostel spaces specifically designed around the needs of students and working professionals in Tamil Nadu. We prioritize safe, clean, community-centric environments.
            </p>
            <p className="mt-2 text-muted leading-relaxed">
              Whether you are arriving for a college program or a corporate assignment, our properties provide the facilities you need to succeed, feel secure, and make lifelong friends.
            </p>
            <Link
              href="#about"
              className="btn-nav-solid d-inline-block mt-4"
              style={{ width: "fit-content", padding: "14px 32px", borderRadius: "var(--radius-pill)" }}
            >
              Read More About Us &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PropertiesByCities() {
  const cities = [
    { name: "Chennai", count: "12 Hostels", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&auto=format&fit=crop&q=80" },
    { name: "Coimbatore", count: "6 Hostels", img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&fit=crop&q=80" },
    { name: "Madurai", count: "4 Hostels", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&auto=format&fit=crop&q=80" },
    { name: "Trichy", count: "3 Hostels", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80" },
    { name: "Salem", count: "2 Hostels", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop&q=80" },
    { name: "Tirunelveli", count: "2 Hostels", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=80" },
    { name: "Vellore", count: "3 Hostels", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&auto=format&fit=crop&q=80" },
    { name: "Erode", count: "2 Hostels", img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&auto=format&fit=crop&q=80" },
  ];

  return (
    <section className="section-light" id="cities">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">LOCATIONS</span>
          <h2 className="section-title">Hostels Across Tamil Nadu</h2>
          <p className="section-desc">
            Explore our verified stays across major education and IT hubs in Tamil Nadu.
          </p>
        </div>
        <div className="cities-grid">
          {cities.map((city, idx) => (
            <div key={idx} className="city-premium-card">
              <img src={city.img} alt={city.name} className="city-bg-img" loading="lazy" />
              <div className="city-overlay">
                <h4>{city.name}</h4>
                <p>{city.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DarkStatsCounter() {
  return (
    <section className="stats-banner-photo" style={{
      background: "linear-gradient(135deg, rgba(8, 31, 74, 0.92) 0%, rgba(12, 43, 92, 0.88) 50%, rgba(4, 15, 36, 0.95) 100%), url('/images/image_6.png') center/cover no-repeat",
      color: "var(--bg-white)",
      position: "relative",
      overflow: "hidden",
      padding: "64px 0"
    }}>
      {/* Background Radial Glow */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60%",
        height: "80%",
        background: "radial-gradient(ellipse at center, rgba(18, 82, 174, 0.25) 0%, transparent 70%)",
        pointerEvents: "none"
      }}></div>

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="counter-grid-4 text-center">
          <div className="stat-glass-card">
            <div className="stat-icon-wrap mb-3">
              <i className="fa-solid fa-house-circle-check"></i>
            </div>
            <h2 className="stat-big-num">25+</h2>
            <p className="stat-sub-lbl">Verified Hostels</p>
          </div>
          <div className="stat-glass-card">
            <div className="stat-icon-wrap mb-3">
              <i className="fa-solid fa-bed"></i>
            </div>
            <h2 className="stat-big-num">2,400+</h2>
            <p className="stat-sub-lbl">Available Beds</p>
          </div>
          <div className="stat-glass-card">
            <div className="stat-icon-wrap mb-3">
              <i className="fa-solid fa-users"></i>
            </div>
            <h2 className="stat-big-num">8,000+</h2>
            <p className="stat-sub-lbl">Satisfied Stays</p>
          </div>
          <div className="stat-glass-card">
            <div className="stat-icon-wrap mb-3">
              <i className="fa-solid fa-city"></i>
            </div>
            <h2 className="stat-big-num">6</h2>
            <p className="stat-sub-lbl">Cities in TN</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="process" className="section-white">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">SIMPLE STEPS</span>
          <h2 className="section-title">How it works</h2>
          <p className="section-desc">
            Get your booking confirmed in 4 simple and completely transparent steps.
          </p>
        </div>
        <div className="steps-grid">
          <div className="step-card step-card-light">
            <div className="step-badge-wrap">
              <span className="step-icon-tile"><i className="fa-solid fa-magnifying-glass"></i></span>
              <span className="step-num-pill">01</span>
            </div>
            <h4>Search Stay</h4>
            <p>Find hostels in your preferred cities based on dates and stay type.</p>
          </div>
          <div className="step-connector">&#8594;</div>
          <div className="step-card step-card-light">
            <div className="step-badge-wrap">
              <span className="step-icon-tile"><i className="fa-solid fa-file-signature"></i></span>
              <span className="step-num-pill">02</span>
            </div>
            <h4>Submit Profile</h4>
            <p>Provide details, verify your email with OTP and upload required documents.</p>
          </div>
          <div className="step-connector">&#8594;</div>
          <div className="step-card step-card-light">
            <div className="step-badge-wrap">
              <span className="step-icon-tile"><i className="fa-solid fa-user-check"></i></span>
              <span className="step-num-pill">03</span>
            </div>
            <h4>Get Approval</h4>
            <p>Our management team reviews your files and quickly allots a hostel bed.</p>
          </div>
          <div className="step-connector">&#8594;</div>
          <div className="step-card step-card-light">
            <div className="step-badge-wrap">
              <span className="step-icon-tile"><i className="fa-solid fa-key"></i></span>
              <span className="step-num-pill">04</span>
            </div>
            <h4>Check-In</h4>
            <p>Step into your new home, complete verify tasks and settle in comfortably.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeamSection() {
  const teamMembers = [
    {
      name: "Arun Kumar",
      role: "Chennai Operations Head & Founder",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Priya Sundaram",
      role: "Resident Success Lead",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Karthik Raja",
      role: "Coimbatore Campus Lead",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Deepika R",
      role: "Student Affairs Head",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Vijay Anand",
      role: "Security & Facilities Lead",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section id="team" className="team-circular-section section-light py-20 relative overflow-hidden" style={{
      background: "var(--bg-light)",
    }}>
      <div className="container mx-auto px-4 relative z-10">
        {/* SECTION HEADER */}
        <div className="section-header text-center mb-16">
          <span className="section-pill">OUR TEAM</span>
          <h2 className="section-title">Meet Our Leadership Team</h2>
          <p className="section-desc max-w-xl mx-auto">
            The dedicated professionals behind TNIHPL ensuring safe, comfortable, and well-managed stays across Tamil Nadu.
          </p>
        </div>

        {/* CIRCULAR AVATARS ROW LAYOUT */}
        <div className="team-circles-row">
          {teamMembers.map((m, idx) => (
            <div key={idx} className="team-circle-card group cursor-pointer">
              {/* CIRCULAR PHOTO CONTAINER */}
              <div className="team-circle-avatar-wrap">
                <img src={m.img} alt={m.name} className="team-circle-img" loading="lazy" />
              </div>
              {/* MEMBER NAME & ROLE BELOW AVATAR */}
              <h4 className="team-circle-name">{m.name}</h4>
              <p className="team-circle-role">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    [
      {
        name: "Deepak Narayanan",
        role: "Anna University Resident",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
        quote: "TNIHPL made moving to Chennai completely stress-free. The Guindy hostel is super clean, meals are fresh, and the Wi-Fi speed is stellar for studying!",
      },
      {
        name: "Meera Krishnan",
        role: "IT Professional, Coimbatore",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        quote: "The digital billing and quick resident support portal are fantastic. I felt safe and welcomed right from day one of my corporate transfer.",
      },
    ],
    [
      {
        name: "Siddharth Verma",
        role: "PSG Tech Student",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        quote: "Awesome student community and top-notch security! The common study lounges and high-speed fiber Wi-Fi made exam preparation super comfortable.",
      },
      {
        name: "Divya Rajan",
        role: "Madurai Campus Resident",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        quote: "Super prompt maintenance support! Any issue logged in the resident portal is resolved within hours by the on-ground management team.",
      },
    ],
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="section-white" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">RESIDENT REVIEWS</span>
          <h2 className="section-title">What Our Residents Say</h2>
          <p className="section-desc">
            Real feedback from students and working professionals living at TNIHPL hostels.
          </p>
        </div>

        {/* Active Carousel Pair */}
        <div className="testimonials-carousel-wrap">
          <div className="testimonials-grid transition-all duration-500">
            {testimonials[activeSlide].map((t, idx) => (
              <div key={idx} className="testimonial-card animate-fade-in">
                <div className="testimonial-author-row">
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                  <div className="testimonial-author-info">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* Interactive Pagination Dots */}
          <div className="carousel-dots mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`carousel-dot ${activeSlide === idx ? "active" : ""}`}
                aria-label={`Slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogSection() {
  const blogs = [
    {
      title: "Top 5 Student Accommodations Tips for First-Timers in Chennai",
      category: "STUDENT GUIDE",
      date: "JULY 12, 2026",
      img: "/images/image_5.jpeg",
      excerpt: "Essential safety features, budget planning tips, and neighborhood highlights to check before booking your first hostel room.",
    },
    {
      title: "How TNIHPL Implements Modern High-Speed Wi-Fi & Smart Security",
      category: "HOSTEL TECH",
      date: "JUNE 28, 2026",
      img: "/images/image_6.png",
      excerpt: "An inside look at our 24/7 CCTV surveillance network, digital door access cards, and dedicated study lounges.",
    },
  ];

  return (
    <section className="section-light" id="news">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">ANNOUNCEMENTS</span>
          <h2 className="section-title">Latest News &amp; Resident Updates</h2>
          <p className="section-desc">
            Stay informed with recent hostel announcements, guidelines, and city onboarding guides.
          </p>
        </div>
        <div className="blog-grid">
          {blogs.map((b, idx) => (
            <div key={idx} className="blog-card">
              <div className="blog-img-wrap">
                <img src={b.img} alt={b.title} />
                <span className="blog-badge-tag">{b.category}</span>
                <span className="blog-date-tag">{b.date}</span>
              </div>
              <div className="blog-content">
                <h3 className="blog-title">{b.title}</h3>
                <p className="blog-excerpt">{b.excerpt}</p>
                <Link href="#" className="blog-read-more">
                  Read More &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Offers() {
  return (
    <section className="section-light py-14" id="amenities">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">AMENITIES</span>
          <h2 className="section-title">Everything you need, included</h2>
          <p className="section-desc">
            We make sure all our hostels are packed with essential facilities for a hassle-free living experience.
          </p>
        </div>
        <div className="amenities-grid">
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-bed"></i></span><span>Furnished Rooms</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-wifi"></i></span><span>High-speed Wi-Fi</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-broom"></i></span><span>Daily Housekeeping</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-utensils"></i></span><span>Meals Available</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-shirt"></i></span><span>Self-service Laundry</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-shield-halved"></i></span><span>24/7 CCTV &amp; Guards</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-bolt"></i></span><span>Full Power Backup</span></div>
          <div className="amenity-tile"><span className="amenity-icon"><i className="fa-solid fa-couch"></i></span><span>Common Lounges</span></div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <>
      {/* CTA STRIP */}
      <div className="footer-cta-banner">
        <div className="container">
          <div className="footer-cta-inner">
            <div>
              <h3 className="footer-cta-title">Book Your Stay with TNIHPL Today</h3>
              <p className="footer-cta-sub">We only work with verified, quality-vetted hostels across Tamil Nadu.</p>
            </div>
            <Link href="/book" className="btn-footer-cta">
              <i className="fa-solid fa-house-circle-check"></i> Register Now
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="site-footer" className="footer">
        <div className="footer-top container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo"><img src="/images/logo.png" alt="TNIHPL Logo" className="footer-logo-img" /></div>
              <p className="footer-brand-desc">
                Premium hostel stays across Tamil Nadu — safe, clean, community-centric, and completely transparent.
              </p>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <i className="fa-solid fa-phone"></i> +91 (000) 000-0000
                </div>
                <div className="footer-contact-item">
                  <i className="fa-solid fa-envelope"></i> hello@tnihpl.example
                </div>
                <div className="footer-contact-item">
                  <i className="fa-solid fa-location-dot"></i> Guindy Industrial Estate, Chennai, Tamil Nadu
                </div>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Useful Links</h4>
              <ul className="footer-links">
                <li><Link href="#about" className="footer-link">About Us</Link></li>
                <li><Link href="#stays" className="footer-link">Hostels</Link></li>
                <li><Link href="#process" className="footer-link">User&rsquo;s Guide</Link></li>
                <li><Link href="#contact-inquiry" className="footer-link">Support Center</Link></li>
                <li><Link href="#" className="footer-link">Press Info</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Explore</h4>
              <ul className="footer-links">
                <li><Link href="/" className="footer-link">Home</Link></li>
                <li><Link href="/book" className="footer-link">Book a Stay</Link></li>
                <li><Link href="/portal/announcements" className="footer-link">Latest News</Link></li>
                <li><Link href="/portal/refunds" className="footer-link">Refund Policy</Link></li>
                <li><Link href="/portal/requests" className="footer-link">Help Center</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Contact With Us</h4>
              <p className="footer-brand-desc">Get latest updates and offers.</p>
              <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your Email" className="footer-email-input" required />
                <button type="submit" className="footer-email-btn" aria-label="Subscribe">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
              <div className="footer-socials mt-3">
                <a href="#" className="social-link" title="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" className="social-link" title="Twitter/X"><i className="fa-brands fa-x-twitter"></i></a>
                <a href="#" className="social-link" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#" className="social-link" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom container">
          <span>&copy; Copyright 2026 TNIHPL. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Claim</a>
            <a href="#">Privacy &amp; Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
}

