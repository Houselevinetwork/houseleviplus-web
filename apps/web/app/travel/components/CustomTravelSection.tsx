"use client";

interface Props { onInquire: () => void; }

export default function CustomTravelSection({ onInquire }: Props) {
  return (
    <section style={{ textAlign: "center", padding: "80px 128px", background: "#f8f6f2" }}>
      <p style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(18,18,18,0.4)", marginBottom: 14 }}>
        Bespoke Journeys
      </p>
      <h3 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(22px,2vw,32px)", fontWeight: 500, color: "#121212", margin: "0 0 18px", letterSpacing: "0.02em" }}>
        Custom Travel Opportunities
      </h3>
      <p style={{ fontFamily: "Lato, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.8, letterSpacing: "0.04em", color: "rgba(18,18,18,0.6)", maxWidth: 560, margin: "0 auto 32px" }}>
        If you&apos;re interested in private tours of the destinations mentioned, or if there is another
        location you are interested in, please contact Levi.
      </p>
      <button
        onClick={onInquire}
        style={{ background: "#121212", color: "#fff", border: "none", padding: "0 32px", height: 47, fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#2c2c2c")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#121212")}
      >
        Inquire Now
      </button>
    </section>
  );
}
