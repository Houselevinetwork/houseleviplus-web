"use client";
import { useState } from "react";
import { travelApi } from "@houselevi/travel-api";
export default function TravelFooter() {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false);
  const submit = async () => { if (!email) return; await travelApi.subscribe({ firstName: "", email }).catch(() => {}); setDone(true); };
  return (
    <footer style={{ background: "#000", color: "#fff", padding: "64px 128px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", borderTop: "1px solid #5C5C5C" }}>
        <div style={{ padding: "32px 32px 32px 0", borderRight: "1px solid #5C5C5C" }}>
          <h3 style={{ fontSize: 30, fontWeight: 400, letterSpacing: "3px", textAlign: "center", margin: "0 0 16px" }}>JOIN THE ADVENTURE</h3>
          <p style={{ fontSize: 15, fontWeight: 500, textAlign: "center", margin: "0 0 24px" }}>Become an insider to receive exclusive first access to new series, promotions, and more.</p>
          {done ? <p style={{ textAlign: "center", letterSpacing: "1.8px" }}>THANK YOU!</p> : (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER YOUR EMAIL" style={{ flex: 1, background: "#1B1B1B", border: "none", color: "#9D9D9D", padding: "0 20px", height: 45, fontSize: 11, letterSpacing: "1.8px", fontFamily: "Inter, sans-serif" }} />
              <button onClick={submit} style={{ background: "#1B1B1B", border: "none", color: "#9D9D9D", padding: "0 16px", height: 45, fontSize: 12, letterSpacing: "2.4px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>SUBMIT</button>
            </div>
          )}
        </div>
        <div style={{ padding: "32px", borderRight: "1px solid #5C5C5C" }}>
          <h3 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "3px", textAlign: "center", margin: "0 0 16px" }}>CONTACT US</h3>
          <p style={{ fontSize: 15, fontWeight: 500, textAlign: "center", margin: "0 0 16px" }}>To make an inquiry, request a custom quote or just keep in touch, please contact us at:</p>
          <p style={{ textAlign: "center", fontSize: 15, textDecoration: "underline", cursor: "pointer", margin: "0 0 24px" }}>gallery@drewdoggett.com</p>
          <p style={{ textAlign: "center", fontSize: 18, letterSpacing: "3.6px", margin: "0 0 15px", cursor: "pointer" }}>TERMS OF USE</p>
          <p style={{ textAlign: "center", fontSize: 18, letterSpacing: "3.6px", cursor: "pointer" }}>FAQ</p>
        </div>
        <div style={{ padding: "32px 0 32px 32px" }}>
          <h3 style={{ fontSize: 30, fontWeight: 400, letterSpacing: "3px", textAlign: "center", margin: "0 0 16px" }}>FOLLOW DREW</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>{["IG", "FB", "TW"].map((s) => <span key={s} style={{ fontSize: 12, letterSpacing: "1.8px", cursor: "pointer" }}>{s}</span>)}</div>
          <p style={{ textAlign: "center", fontSize: 15, color: "#A2A3A7", lineHeight: 1.4 }}>Copyright 2026 by Drew Doggett Photography, LLC. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
