"use client";
import type { TravelTestimonial } from "../types";

export default function TestimonialsSection({ testimonials }: { testimonials: TravelTestimonial[] }) {
  if (!testimonials.length) return null;

  return (
    <section>
      <div style={{ textAlign: "center", padding: "64px 128px 0", background: "#fff" }}>
        <p style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(18,18,18,0.4)", marginBottom: 14 }}>
          Experiences
        </p>
        <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(28px,3vw,42px)", fontWeight: 500, color: "#121212", margin: 0 }}>
          Travel with Levi
        </h2>
      </div>

      {testimonials.map((t, i) => {
        const right = t.side === "right";
        const dark = i % 2 === 0;
        return (
          <div key={t.id} style={{ background: dark ? "#121212" : "#f8f6f2", color: dark ? "#fff" : "#121212", position: "relative", minHeight: 420, overflow: "hidden" }}>
            {t.imageUrl && (
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${t.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.3, height: "60%" }} />
            )}
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1440, margin: "0 auto", padding: "48px 128px", display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", marginTop: t.imageUrl ? "38%" : 0 }}>
              <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(18px,1.8vw,26px)", fontWeight: 500, margin: "0 0 4px" }}>{t.clientName}</p>
              {t.destination && (
                <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, fontStyle: "italic", letterSpacing: "0.12em", opacity: 0.55, margin: "0 0 16px" }}>{t.destination}</p>
              )}
              <blockquote style={{ fontFamily: "Lato, sans-serif", fontSize: "clamp(13px,1vw,16px)", fontWeight: 300, lineHeight: 1.75, letterSpacing: "0.04em", margin: 0, maxWidth: 680, textAlign: right ? "right" : "left", opacity: 0.8 }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </div>
          </div>
        );
      })}
    </section>
  );
}
