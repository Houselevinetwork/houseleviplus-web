"use client";
import { useState } from "react";
import PackageCard from "./PackageCard";
import type { TravelPackage } from "../types";

const CONTINENTS = ["Africa", "Europe", "Asia", "Australia", "Americas"] as const;

interface Props { 
  packages: TravelPackage[]; 
  onInquire: (p: TravelPackage) => void; 
}

export default function PackageGrid({ packages, onInquire }: Props) {
  const [filter, setFilter] = useState<string>("All");
  const filtered = filter === "All" ? packages : packages.filter((p) => p.continent === filter);

  return (
    <section id="packages" style={{ background: "#fff" }}>
      {/* Title block */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 128px 40px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(18,18,18,0.4)", marginBottom: 12 }}>
          {filter === "All" ? "All Destinations" : filter}
        </p>
        <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(28px,3vw,44px)", fontWeight: 500, color: "#121212", letterSpacing: "0.02em", margin: "0 0 40px" }}>
          Upcoming Travel Opportunities
        </h2>

        {/* Continent filter — sits under the title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(18,18,18,0.35)", marginRight: 8 }}>
            Travel by Continent
          </span>
          {(["All", ...CONTINENTS] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: "8px 18px",
                background: filter === c ? "#121212" : "transparent",
                border: `1px solid ${filter === c ? "#121212" : "#d8d4cc"}`,
                cursor: "pointer", fontFamily: "Lato, sans-serif", fontSize: 11,
                fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                color: filter === c ? "#fff" : "rgba(18,18,18,0.55)", transition: "all 0.18s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Package cards — responsive grid */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(20px, 5vw, 80px) clamp(20px, 5vw, 128px)" }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", fontFamily: "Lato, sans-serif", fontSize: 14, color: "#bbb", fontStyle: "italic", padding: "60px 0" }}>
            {filter === "All"
              ? "No upcoming journeys yet — check back soon."
              : `No ${filter} packages at the moment — check back soon or enquire below.`}
          </p>
        )}
        {filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(20px, 5vw, 48px)" }}>
            {filtered.map((pkg, index) => (
              <div key={pkg.id || `package-${index}`}>
                <PackageCard pkg={pkg} onInquire={onInquire} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #packages > div:last-child > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
