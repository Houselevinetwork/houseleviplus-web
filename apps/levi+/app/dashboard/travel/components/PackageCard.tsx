"use client";
import type { TravelPackage } from "@houselevi/travel-api";
interface Props { pkg: TravelPackage; wide?: boolean; onInquire: (p: TravelPackage) => void; }
export default function PackageCard({ pkg, wide, onInquire }: Props) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: wide ? "clamp(300px, 55vw, 789px)" : "clamp(200px, 27vw, 385px)", backgroundImage: `url(${pkg.heroImage.url})`, backgroundSize: "cover", backgroundPosition: "center" }} role="img" aria-label={pkg.heroImage.altText} />
      <div style={{ padding: "39px 0 16px", textAlign: "center" }}>
        <h3 style={{ fontSize: "clamp(22px, 2.3vw, 33px)", fontWeight: 400, margin: "0 0 12px", lineHeight: 1.07 }}>{pkg.title}</h3>
        {pkg.tagline && <p style={{ color: pkg.taglineColor === "red" ? "#B8312F" : "#b8962f", fontSize: 15.6, margin: "0 0 12px" }}>{pkg.tagline}</p>}
        <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.4, letterSpacing: "0.96px", margin: "0 0 8px" }}>{pkg.description}</p>
        {pkg.noteForPhotographers && <p style={{ fontSize: 15, fontWeight: 300, fontStyle: "italic", margin: "8px 0 0" }}>{pkg.noteForPhotographers}</p>}
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
          <button onClick={() => onInquire(pkg)} style={{ background: "#000", color: "#fff", border: "1px solid #fff", padding: "0 17px", height: 44, fontSize: 13, fontWeight: 700, letterSpacing: "1.8px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>CONTACT US</button>
        </div>
      </div>
    </div>
  );
}
