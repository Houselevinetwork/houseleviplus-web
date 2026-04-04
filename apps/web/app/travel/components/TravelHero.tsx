"use client";
import { useEffect, useState } from "react";
import type { TravelHeroData } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function TravelHero() {
  const [hero, setHero] = useState<TravelHeroData>({ imageUrl: "", headline: "" });

  useEffect(() => {
    fetch(`${API}/travel/hero`)
      .then((r) => r.json())
      .then((d) => setHero({ imageUrl: d?.imageUrl ?? "", headline: d?.headline ?? "" }))
      .catch(() => {});
  }, []);

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: 600, background: "#0a0a0a", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${hero.imageUrl || "https://placehold.co/1440x960/0a0a0a/333?text=."})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 2 }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 3, gap: 24, padding: "0 40px", textAlign: "center" }}>
        {hero.headline && (
          <h1 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontWeight: 400, color: "#fff", fontSize: "clamp(32px,4vw,58px)", letterSpacing: "0.04em", lineHeight: 1.15, margin: 0 }}>
            {hero.headline}
          </h1>
        )}

        <a href="#packages" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 130, height: 47, padding: "0 30px", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: 13, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", background: "transparent", boxShadow: "inset 0 0 0 1px #fff", textDecoration: "none" }}>
          View Upcoming Journeys
        </a>
      </div>
    </section>
  );
}
