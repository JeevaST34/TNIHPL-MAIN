"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 1.2s
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    // Completely remove preloader from DOM after fade animation completes
    const timer2 = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!loading) return null;

  const letters = ["T", "N", "I", "H", "P", "L"];

  return (
    <div
      className={`preloader-overlay ${fadeOut ? "fade-out" : ""}`}
      aria-hidden="true"
    >
      <div className="preloader-content">
        <div className="preloader-text-wrap">
          {letters.map((char, index) => (
            <span
              key={index}
              className={`preloader-letter ${index === letters.length - 1 ? "accent" : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {char}
            </span>
          ))}
        </div>
        <div className="preloader-subtext">Comfortable, Secure Stays</div>
      </div>
    </div>
  );
}
