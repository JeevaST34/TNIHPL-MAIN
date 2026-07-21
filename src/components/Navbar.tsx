"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#team", label: "Our Team" },
  { href: "#stays", label: "Properties" },
  { href: "#news", label: "Blogs" },
  { href: "#contact-inquiry", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loginMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(e.target as Node)) {
        setLoginMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loginMenuOpen]);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark-theme")) {
      setDarkMode(true);
    }

    const handleScroll = () => {
      const scrollPos =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      if (scrollPos > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const pathname = usePathname();

  return (
    <>
      {/* 1. TOP BAR STRIP */}
      {/* <div className="top-bar">
        <div className="container">
          <div className="top-bar-inner">
            <div className="top-bar-info">
              <span className="top-bar-item">
                <i className="fa-solid fa-location-dot"></i> Chennai &amp; Coimbatore, Tamil Nadu
              </span>
              <span className="top-bar-item">
                <i className="fa-solid fa-envelope"></i> hello@tnihpl.example
              </span>
            </div>
            <div className="top-bar-socials">
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </div> */}

      {/* 2. NAVBAR */}
      <header
        className={`header ${scrolled ? "scrolled" : ""}`}
        id="site-header"
      >
        <div className="container">
          <nav className="navbar">
            <Link href="/" className="nav-brand">
              <img
                src="/images/logo.png"
                className="nav-logo-img"
                alt="TNIHPL Logo"
              />
            </Link>

            {pathname !== "/book" && (
              <ul className={`nav-menu ${mobileOpen ? "active" : ""}`}>
                {links.map((l) => (
                  <li key={l.href} className="nav-item">
                    <a
                      href={l.href}
                      className="nav-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="nav-actions">
              <button
                onClick={toggleDarkMode}
                className="theme-toggle-btn"
                aria-label="Toggle dark mode"
              >
                <i
                  className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}
                ></i>
              </button>
              <div
                ref={loginMenuRef}
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  className="btn-nav-outline"
                  onClick={() => setLoginMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={loginMenuOpen}
                >
                  Login <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.7em", marginLeft: "6px" }}></i>
                </button>
                {loginMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: "200px",
                      background: "var(--bg-white)",
                      borderRadius: "12px",
                      boxShadow: "var(--shadow-lg)",
                      border: "1px solid var(--border-color-light)",
                      overflow: "hidden",
                      zIndex: 50,
                    }}
                  >
                    <Link
                      href="/portal/login"
                      className="login-dropdown-item"
                      onClick={() => setLoginMenuOpen(false)}
                    >
                      <i className="fa-solid fa-user"></i> Resident Login
                    </Link>
                    <Link
                      href="/portal-corporate/login"
                      className="login-dropdown-item"
                      style={{ borderTop: "1px solid var(--border-color-light)" }}
                      onClick={() => setLoginMenuOpen(false)}
                    >
                      <i className="fa-solid fa-building"></i> Corporate Login
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/book" className="btn-nav-solid">
                Book a Stay
              </Link>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="mobile-nav-toggle-wrap">
              <button
                onClick={toggleDarkMode}
                className="theme-toggle-btn nav-theme-toggle"
                aria-label="Toggle dark mode"
              >
                <i
                  className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}
                ></i>
              </button>
              <div
                className={`nav-toggle ${mobileOpen ? "active" : ""}`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`drawer-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      ></div>
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img
              src="/images/logo.png"
              className="nav-logo-img"
              alt="TNIHPL Logo"
              style={{ height: "32px" }}
            />
          </div>
          <div className="drawer-close" onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>

        <div className="drawer-menu">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="drawer-link"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="drawer-actions">
          <Link
            href="/portal/login"
            className="btn-nav-outline text-center"
            onClick={() => setMobileOpen(false)}
          >
            Resident Login
          </Link>
          <Link
            href="/portal-corporate/login"
            className="btn-nav-outline text-center"
            onClick={() => setMobileOpen(false)}
          >
            Corporate Login
          </Link>
          <Link
            href="/book"
            className="btn-nav-solid text-center"
            onClick={() => setMobileOpen(false)}
          >
            Book a stay
          </Link>
        </div>
      </div>
    </>
  );
}
