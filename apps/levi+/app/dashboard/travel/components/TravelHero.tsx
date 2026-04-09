"use client";
export default function TravelHero() {
  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: 600, background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://placehold.co/1440x960/1a1a1a/333?text=.)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "18%" }}>
        <h1 style={{ color: "#000", fontSize: "clamp(28px, 3.1vw, 45px)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.04, textAlign: "center", margin: 0, fontFamily: "Inter, sans-serif" }}>
          Curated Journeys With Drew Doggett
        </h1>
      </div>
    </section>
  );
}
