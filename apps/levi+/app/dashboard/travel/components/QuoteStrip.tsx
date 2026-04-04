"use client";
interface Quote { id: string; text: string; author: string; }
export default function QuoteStrip({ quotes }: { quotes: Quote[] }) {
  return (
    <div style={{ maxWidth: 1184, margin: "0 auto", padding: "0 128px" }}>
      {quotes.map((q) => (
        <div key={q.id} style={{ padding: "63px 0 64px", textAlign: "center" }}>
          <p style={{ fontSize: "clamp(16px, 1.5vw, 21.6px)", fontStyle: "italic", fontWeight: 500, letterSpacing: "3px", lineHeight: 1.6, color: "#000", margin: 0 }}>&ldquo;{q.text}&rdquo;</p>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 100, height: 1, background: "#808080" }} />
            <span style={{ fontSize: 20, fontWeight: 500 }}>- {q.author}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
