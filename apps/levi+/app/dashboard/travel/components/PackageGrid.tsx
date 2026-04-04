"use client";
import type { TravelPackage } from "@houselevi/travel-api";
import PackageCard from "./PackageCard";
interface Props { packages: TravelPackage[]; onInquire: (p: TravelPackage) => void; }
export default function PackageGrid({ packages, onInquire }: Props) {
  const sorted = [...packages].sort((a, b) => a.order - b.order);
  const [first, ...rest] = sorted;
  const rows: TravelPackage[][] = [];
  for (let i = 0; i < rest.length; i += 2) rows.push(rest.slice(i, i + 2));
  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 128px" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 400, letterSpacing: "0.96px", margin: "0 0 48px" }}>Upcoming Travel Opportunities</h2>
      {first && <div style={{ marginBottom: 64 }}><PackageCard pkg={first} wide onInquire={onInquire} /></div>}
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))", gap: 32, marginBottom: 64 }}>
          {row.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} onInquire={onInquire} />)}
        </div>
      ))}
    </section>
  );
}
