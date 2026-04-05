"use client";
import { useState } from "react";
import type { TravelPackage } from "../types";

interface Props { pkg: TravelPackage; wide?: boolean; onInquire: (p: TravelPackage) => void; }

export default function PackageCard({ pkg, wide, onInquire }: Props) {
  const [hov, setHov] = useState(false);
  const isFull = pkg.spotsRemaining === 0;
  const dep = pkg.departureDate
    ? new Date(pkg.departureDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  return (
    <div style={{ width: "100%" }}>
      {/* Image */}
      <div style={{ position: "relative", width: "100%", height: wide ? "clamp(300px,55vw,789px)" : "clamp(200px,27vw,385px)", background: "#F3F3F3", overflow: "hidden" }}>
        <img
          src={pkg.imageUrl ?? `https://placehold.co/800x500/F3F3F3/999?text=${encodeURIComponent(pkg.destination)}`}
          alt={pkg.destination}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform 0.5s ease" }}
        />
        {pkg.spotsRemaining > 0 && pkg.spotsRemaining <= 5 && (
          <div style={{ position: "absolute", top: 14, right: 14, background: "#DC2626", padding: "5px 12px", fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
            Only {pkg.spotsRemaining} {pkg.spotsRemaining === 1 ? "Space" : "Spaces"} Left
          </div>
        )}
        {isFull && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(18,18,18,0.6)", border: "1px solid rgba(18,18,18,0.25)", padding: "8px 20px", background: "#fff" }}>Fully Booked</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "32px 0 16px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(18,18,18,0.4)", marginBottom: 10 }}>
          {pkg.continent}{dep ? ` · ${dep}` : ""}
        </p>
        <h3 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: "clamp(22px,2.3vw,33px)", fontWeight: 500, color: "#121212", margin: "0 0 12px", lineHeight: 1.07 }}>
          {pkg.destination}
        </h3>
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.75, letterSpacing: "0.04em", color: "rgba(18,18,18,0.6)", margin: "0 0 8px" }}>
          {pkg.description}
        </p>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => !isFull && onInquire(pkg)}
            disabled={isFull}
            style={{ background: isFull ? "transparent" : "#121212", color: isFull ? "#bbb" : "#fff", border: `1px solid ${isFull ? "#d8d4cc" : "#121212"}`, padding: "0 32px", height: 47, fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: isFull ? "not-allowed" : "pointer", transition: "background .2s" }}
          >
            {isFull ? "Fully Booked" : "Contact Us"}
          </button>
        </div>
      </div>
    </div>
  );
}
