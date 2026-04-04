"use client";
export default function NoteFromHost() {
  return (
    <section>
      <div style={{ margin: "0 128px", borderTop: "1px solid #808080", paddingTop: 48 }} />
      <div style={{ maxWidth: 978, margin: "0 auto", padding: "0 128px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px, 3.2vw, 46px)", fontWeight: 400, margin: "0 0 33px" }}>A Note From Drew</h2>
        {["As a photographer, I\u2019ve had the privilege of logging countless days in the most remarkable locations while traveling the world to photograph the most unique people, places, and animals.", "Along the way, I\u2019ve amassed an expansive network of guides, top lodges, and local contacts. I have also discovered favored locations, allowing me to create my fine art photography.", "After the gratitude and wonder these locations have inspired in my life and my work, I find immense joy in sharing these special places with others.", "I hope to share these incredible locations and create the memories of a lifetime with you."].map((p, i) => (
          <p key={i} style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.4, letterSpacing: "0.96px", margin: "0 0 16px" }}>{p}</p>
        ))}
        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          {/* Signature image URL comes from CMS/admin upload */}
          <img src="https://placehold.co/401x70/000/000?text=signature" alt="Drew Doggett signature" style={{ height: 70, opacity: 0.85 }} />
        </div>
      </div>
      <div style={{ margin: "0 128px", borderTop: "1px solid #808080" }} />
    </section>
  );
}
