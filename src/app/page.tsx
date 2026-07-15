import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedStays from "@/components/FeaturedStays";
import Contact from "@/components/Contact";
import {
  TrustBadges,
  BookWithConfidence,
  PropertiesByCities,
  HowItWorks,
  DarkStatsCounter,
  TeamSection,
  Offers,
  TestimonialsSection,
  BlogSection,
  Footer,
} from "@/components/StaticSections";

export default function Home() {
  return (
    <>
      {/* 0. BRAND TEXT PRELOADER */}
      <Preloader />

      {/* 1. TOP BAR + 2. NAVBAR */}
      <Navbar />

      <main>
        {/* 3. HERO (Background Photo, Pill Badge, H1, Social Proof Avatars, Overlapping Search Card) */}
        <Hero />

        {/* 4. BENEFITS SECTION (4-Column Icon Grid) */}
        <TrustBadges />

        {/* 5. FEATURE SPLIT SECTION (Image Collage + 150K+ Renters Stat Card + 2x2 Checkmark Grid) */}
        <BookWithConfidence />

        {/* 6. LATEST PROPERTIES (3-Column Property Cards Grid) */}
        <FeaturedStays />

        {/* 7. PROPERTIES BY CITIES (4x2 City Pill Cards Grid) */}
        <PropertiesByCities />

        {/* 8. WORK PROCESS (3-Step Rounded Cards Grid) */}
        <HowItWorks />

        {/* 9. STATS BANNER (Full-width Dark Background Photo, 4-Column Stat Blocks) */}
        <DarkStatsCounter />

        {/* 10. TEAM SECTION (4-Column Team Cards Grid) */}
        <TeamSection />

        {/* 11. AMENITIES GRID */}
        <Offers />

        {/* 12. TESTIMONIALS (2-Column Review Cards + Carousel Dots) */}
        <TestimonialsSection />

        {/* 13. BLOG SECTION "Recent Market Trends" (2-Column Blog Cards Grid) */}
        <BlogSection />

        {/* 14. CONTACT SECTION "Let's Connect" (Left Form Card + Right Dark Info Card) */}
        <Contact />
      </main>

      {/* 15. CTA STRIP + 16. FOOTER */}
      <Footer />
    </>
  );
}

