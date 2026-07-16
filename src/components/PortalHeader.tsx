"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { clearToken } from "@/lib/resident";

const links = [
  { href: "/portal", label: "Dashboard", icon: "fa-solid fa-house-chimney" },
  { href: "/portal/announcements", label: "News", icon: "fa-solid fa-newspaper" },
  { href: "/portal/bills", label: "Bills", icon: "fa-solid fa-file-invoice-dollar" },
  { href: "/portal/requests", label: "Requests", icon: "fa-solid fa-headset" },
  { href: "/portal/refunds", label: "Refunds", icon: "fa-solid fa-rotate-left" },
  { href: "/portal/profile", label: "Profile", icon: "fa-solid fa-id-card" },
];

export default function PortalHeader() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark-theme")) {
      setDarkMode(true);
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollPos > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

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

  function signOut() {
    clearToken();
    router.replace("/portal/login");
  }

  return (
    <>
      <header className={`header header-subpage ${scrolled ? "scrolled" : ""}`} id="site-header">
        <div className="container">
          <nav className="navbar">
            <Link href="/" className="nav-brand">
              <img src="/images/logo.png" className="nav-logo-img" alt="TNIHPL Logo" />
            </Link>

            {/* Public nav items removed for logged-in resident portal */}

            <div className="nav-actions">
              <button
                onClick={toggleDarkMode}
                className="theme-toggle-btn"
                aria-label="Toggle dark mode"
              >
                <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
              </button>
              <button onClick={signOut} className="btn-nav-outline flex items-center gap-1.5">
                <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i> Sign out
              </button>
            </div>

            {/* Mobile Theme Toggle & Actions */}
            <div className="mobile-nav-toggle-wrap">
              <button
                onClick={toggleDarkMode}
                className="theme-toggle-btn nav-theme-toggle"
                aria-label="Toggle dark mode"
              >
                <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
              </button>
              <button onClick={signOut} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 text-white border border-white/20">
                Sign out
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`drawer-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)}></div>
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img src="/images/logo.png" className="nav-logo-img" alt="TNIHPL Logo" style={{ height: "32px" }} />
          </div>
          <div className="drawer-close" onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>

        <div className="drawer-menu">
        </div>

        <div className="drawer-actions">
          <button onClick={() => { setMobileOpen(false); signOut(); }} className="btn-nav-outline text-center w-full">
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export function PortalSubnav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/portal" ? pathname === "/portal" : pathname.startsWith(href));

  return (
    <div className="portal-subnav-bar">
      <div className="container">
        <ul className="portal-tab-list" id="portal-tab-menu">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`portal-tab-link ${isActive(l.href) ? "active" : ""}`}
              >
                <i className={l.icon}></i> {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
