"use client";
import type { TravelTestimonial } from "../../../lib/types/travel.types";
export default function TestimonialsSection({ testimonials }: { testimonials: TravelTestimonial[] }) {
  return (
    <section>
      <div style={{ textAlign: "center", padding: "64px 128px 0" }}>
        <h2 style={{ fontSize: "clamp(32px, 3.5vw, 51px)", fontStyle: "italic", fontWeight: 500, margin: 0 }}>TESTIMONIALS</h2>
      </div>
      {testimonials.map((t, i) => {
        const dark = t.theme === "dark" || i % 2 === 0;
        const right = t.side === "right";
        return (
          <div key={t.id} style={{ background: dark ? "#000" : "#fff", color: dark ? "#fff" : "#000", position: "relative", minHeight: 450, overflow: "hidden" }}>
            {t.imageUrl && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${t.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: dark ? 1 : 0.6, height: "60%" }} />}
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1440, margin: "0 auto", padding: "48px 128px", display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", marginTop: t.imageUrl ? "45%" : 0 }}>
              <p style={{ fontSize: "clamp(20px, 2vw, 29px)", fontWeight: 400, margin: "0 0 4px" }}>{t.clientName}</p>
              {t.destination && <p style={{ fontSize: 20, fontStyle: "italic", fontWeight: 500, letterSpacing: "1.89px", margin: "0 0 16px" }}>{t.destination}</p>}
              <blockquote style={{ fontSize: "clamp(14px, 1.1vw, 18px)", fontWeight: 300, lineHeight: 1.4, letterSpacing: "0.96px", margin: 0, maxWidth: 753, textAlign: right ? "right" : "left" }}>{t.quote}</blockquote>
            </div>
          </div>
        );
      })}
    </section>
  );
}
