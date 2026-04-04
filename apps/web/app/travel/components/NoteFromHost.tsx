"use client";
import type { NoteData } from "../types";

export default function NoteFromHost({ note }: { note: NoteData | null }) {
  if (!note?.body) return null;

  const paragraphs = note.body.split("\n").filter(Boolean);

  return (
    <section style={{ background: "#fff" }}>
      <div style={{ margin: "0 128px", borderTop: "1px solid #eeebe6", paddingTop: 48 }} />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 128px 48px", textAlign: "center" }}>
        {note.imageUrl && (
          <img src={note.imageUrl} alt="Levi" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 24, border: "2px solid #eeebe6" }} />
        )}
        <p style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(18,18,18,0.4)", marginBottom: 16 }}>
          A Note from the Host
        </p>
        <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 500, color: "#121212", margin: "0 0 28px" }}>
          A Note From Levi
        </h2>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ fontFamily: "Lato, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.8, letterSpacing: "0.04em", color: "rgba(18,18,18,0.65)", margin: "0 0 16px" }}>{p}</p>
        ))}
      </div>
      <div style={{ margin: "0 128px", borderTop: "1px solid #eeebe6" }} />
    </section>
  );
}
