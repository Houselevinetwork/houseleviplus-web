"use client";
import { useState } from "react";
import type { TravelPackage, CreateInquiryDto } from "../../../lib/types/travel.types";
interface Props { isOpen: boolean; pkg: TravelPackage; onClose: () => void; onSubmit: (d: Omit<CreateInquiryDto, "packageId" | "packageSlug">) => Promise<void>; }
export default function InquiryModal({ isOpen, pkg, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false); const [done, setDone] = useState(false);
  if (!isOpen) return null;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inp = (label: string, key: keyof typeof form, type = "text") => <input type={type} placeholder={label} value={form[key]} onChange={set(key)} style={{ width: "100%", padding: "17px 10px", border: "1px solid #9D9D9D", fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "1.8px", color: "#666", marginBottom: 10, boxSizing: "border-box" as const }} />;
  const submit = async () => { if (!form.firstName || !form.email) return; setLoading(true); try { await onSubmit(form); setDone(true); } catch { alert("Something went wrong."); } finally { setLoading(false); } };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", width: 660, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", borderRadius: 4, padding: "48px 64px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: 20, cursor: "pointer" }}></button>
        {done ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}><h3 style={{ fontSize: 24, fontWeight: 400 }}>Thank you!</h3><p>We&apos;ll be in touch about {pkg.destination}.</p></div>
        ) : (
          <>
            <p style={{ textAlign: "center", fontSize: 16, fontWeight: 500, letterSpacing: "0.96px", margin: "0 0 8px" }}>INQUIRE ABOUT</p>
            <h3 style={{ textAlign: "center", fontSize: 27, fontWeight: 400, margin: "0 0 32px" }}>{pkg.title}</h3>
            {inp("FIRST NAME", "firstName")}
            {inp("LAST NAME", "lastName")}
            {inp("EMAIL", "email", "email")}
            {inp("PHONE (OPTIONAL)", "phone", "tel")}
            <textarea placeholder="MESSAGE (OPTIONAL)" value={form.message} onChange={set("message")} style={{ width: "100%", padding: "17px 10px", border: "1px solid #9D9D9D", fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "1.8px", color: "#666", height: 100, resize: "none", marginBottom: 10, boxSizing: "border-box" as const }} />
            <button onClick={submit} disabled={loading} style={{ width: "100%", background: "#000", color: "#fff", border: "none", height: 44, fontSize: 12, fontWeight: 700, letterSpacing: "1.8px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}>{loading ? "SENDING..." : "SUBMIT INQUIRY"}</button>
          </>
        )}
      </div>
    </div>
  );
}
