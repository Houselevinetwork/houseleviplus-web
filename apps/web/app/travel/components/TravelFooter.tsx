"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://houselevi.com";

export default function TravelFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email) return;
    await fetch(`${API}/travel/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setDone(true);
  };

  return (
    <footer style={{ background: "#121212", color: "#fff", padding: "64px 128px", textAlign: "center" }}>
      <p style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
        Stay in the Loop
      </p>
      <h3 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(20px,2vw,28px)", fontWeight: 400, color: "#fff", margin: "0 0 28px" }}>
        New Journeys, First to Know
      </h3>

      {done ? (
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>You&apos;re on the list ?</p>
      ) : (
        <div style={{ display: "flex", maxWidth: 400, margin: "0 auto", gap: 0 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ flex: 1, padding: "13px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRight: "none", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: 13, outline: "none" }}
          />
          <button
            onClick={submit}
            style={{ padding: "0 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}
          >
            Subscribe
          </button>
        </div>
      )}
    </footer>
  );
}
