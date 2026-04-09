"use client";
export default function CustomTravelSection() {
  return (
    <section style={{ textAlign: "center", padding: "0 128px 80px" }}>
      <h3 style={{ fontSize: "clamp(22px, 2vw, 30px)", fontWeight: 400, margin: "0 0 16px" }}>Custom Travel Opportunities</h3>
      <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.4, letterSpacing: "0.96px", maxWidth: 600, margin: "0 auto 24px" }}>
        If you&apos;re interested in private tours of the destinations mentioned, or if there is another location you are interested in, please contact Lily.
      </p>
      <button style={{ background: "#000", color: "#fff", border: "1px solid #fff", padding: "0 17px", height: 44, fontSize: 13, fontWeight: 500, letterSpacing: "1.8px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>INQUIRE NOW</button>
    </section>
  );
}
