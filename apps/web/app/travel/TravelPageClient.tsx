"use client";
import { useState, useEffect } from "react";
import type { TravelPackage, TravelTestimonial, InquiryFormData, NoteData } from "./types";
import TravelHero from "./components/TravelHero";
import PackageGrid from "./components/PackageGrid";
import CustomTravelSection from "./components/CustomTravelSection";
import NoteFromHost from "./components/NoteFromHost";
import TestimonialsSection from "./components/TestimonialsSection";
import TravelFooter from "./components/TravelFooter";
import InquiryModal from "./components/InquiryModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function TravelPageClient() {
  const [packages, setPackages]         = useState<TravelPackage[]>([]);
  const [testimonials, setTestimonials] = useState<TravelTestimonial[]>([]);
  const [note, setNote]                 = useState<NoteData | null>(null);
  const [selectedPkg, setSelectedPkg]   = useState<TravelPackage | null>(null);
  const [customOpen, setCustomOpen]     = useState(false);

  useEffect(() => {
    fetch(`${API}/travel/packages?status=active`).then(r => r.json())
      .then(d => setPackages(d?.data ?? d ?? [])).catch(() => {});
    fetch(`${API}/travel/testimonials?status=approved`).then(r => r.json())
      .then(d => setTestimonials(d?.data ?? [])).catch(() => {});
    fetch(`${API}/travel/note`).then(r => r.json())
      .then(d => setNote(d?.data ?? d ?? null)).catch(() => {});
  }, []);

  const handlePackageSubmit = async (form: InquiryFormData) => {
    if (!selectedPkg) return;
    const res = await fetch(`${API}/travel/inquiries`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, packageId: selectedPkg.id, packageSlug: selectedPkg.slug }),
    });
    if (!res.ok) throw new Error("Inquiry failed");
    setPackages(prev => prev.map(p =>
      p.id === selectedPkg.id ? { ...p, spotsRemaining: Math.max(0, p.spotsRemaining - 1) } : p
    ));
  };

  const handleCustomSubmit = async (form: InquiryFormData) => {
    const res = await fetch(`${API}/travel/inquiries/custom`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Inquiry failed");
  };

  return (
    <main style={{ fontFamily: "Lato, sans-serif", background: "#fff", color: "#121212" }}>
      <TravelHero />
      <PackageGrid packages={packages} onInquire={setSelectedPkg} />

      {/* Quote â€” standalone section between packages and custom travel */}
      <div style={{ background: "#fff", borderTop: "1px solid #eeebe6", borderBottom: "1px solid #eeebe6" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "72px 128px", textAlign: "center" }}>
          <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(16px,1.5vw,22px)", fontStyle: "italic", fontWeight: 400, letterSpacing: "0.06em", lineHeight: 1.7, color: "#121212", margin: "0 0 24px" }}>
            &ldquo;The world is a book, and those who do not travel read only one page.&rdquo;
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 60, height: 1, background: "#d8d4cc" }} />
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(18,18,18,0.45)" }}>â€” Saint Augustine</span>
          </div>
        </div>
      </div>

      <CustomTravelSection onInquire={() => setCustomOpen(true)} />
      <NoteFromHost note={note} />
      <TestimonialsSection testimonials={testimonials} />
      <TravelFooter />

      {selectedPkg && (
        <InquiryModal
          isOpen
          destination={selectedPkg.destination}
          spotsRemaining={selectedPkg.spotsRemaining}
          onClose={() => setSelectedPkg(null)}
          onSubmit={handlePackageSubmit}
        />
      )}
      {customOpen && (
        <InquiryModal
          isOpen
          destination="Custom Journey"
          onClose={() => setCustomOpen(false)}
          onSubmit={handleCustomSubmit}
        />
      )}
    </main>
  );
}
