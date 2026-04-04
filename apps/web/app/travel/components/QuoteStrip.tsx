"use client";

interface Quote { id: string; text: string; author: string; }

export default function QuoteStrip({ quotes }: { quotes: Quote[] }) {
  return (
    <div style={{ maxWidth: 1184, margin: "0 auto", padding: "0 128px" }}>
      {quotes.map((q) => (
        <div key={q.id} style={{ padding: "63px 0 64px", textAlign: "center" }}>
          <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(16px,1.5vw,22px)", fontStyle: "italic", fontWeight: 400, letterSpacing: "0.06em", lineHeight: 1.6, color: "#121212", margin: 0 }}>
            &ldquo;{q.text}&rdquo;
          </p>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 80, height: 1, background: "#d8d4cc" }} />
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(18,18,18,0.55)" }}>— {q.author}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
