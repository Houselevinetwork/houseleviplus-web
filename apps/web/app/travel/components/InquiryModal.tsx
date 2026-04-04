"use client";
import { useState } from "react";
import type { InquiryFormData } from "../types";

interface Props {
  isOpen: boolean;
  destination: string;
  spotsRemaining?: number;
  onClose: () => void;
  onSubmit: (d: InquiryFormData) => Promise<void>;
}

const S = {
  input: { width: "100%", padding: "12px 14px", background: "#f8f6f2", border: "1px solid #d8d4cc", fontFamily: "Lato, sans-serif", fontSize: 13, color: "#121212", outline: "none", borderRadius: 1, boxSizing: "border-box" as const, marginBottom: 12 },
  label: { display: "block", fontFamily: "Lato, sans-serif", fontSize: 9, fontWeight: 600 as const, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#999", marginBottom: 6 },
};

export default function InquiryModal({ isOpen, destination, spotsRemaining, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<InquiryFormData>({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const set = (k: keyof InquiryFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.firstName || !form.email) return;
    setLoading(true);
    try { await onSubmit(form); setDone(true); }
    catch { alert("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,22,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", border: "1px solid #eeebe6", width: "100%", maxWidth: 540, borderRadius: 2, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #eeebe6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(18,18,18,0.4)", marginBottom: 5 }}>Enquire</div>
            <div style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 20, fontWeight: 500, color: "#121212" }}>{destination}</div>
            {spotsRemaining != null && (
              <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, color: "#bbb", marginTop: 3 }}>
                {spotsRemaining} space{spotsRemaining !== 1 ? "s" : ""} remaining
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 24, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {done ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 22, color: "#121212", marginBottom: 10 }}>Thank you!</div>
            <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "rgba(18,18,18,0.55)", lineHeight: 1.7 }}>We&apos;ll be in touch about {destination} within 48 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: "12px 32px", background: "#121212", border: "none", cursor: "pointer", fontFamily: "Lato, sans-serif", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fff", fontWeight: 700 }}>Close</button>
          </div>
        ) : (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><label style={S.label}>First Name *</label><input value={form.firstName} onChange={set("firstName")} style={S.input} /></div>
              <div style={{ flex: 1 }}><label style={S.label}>Last Name</label><input value={form.lastName} onChange={set("lastName")} style={S.input} /></div>
            </div>
            <label style={S.label}>Email *</label>
            <input type="email" value={form.email} onChange={set("email")} style={S.input} />
            <label style={S.label}>Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={set("phone")} style={S.input} />
            <label style={S.label}>Message (optional)</label>
            <textarea value={form.message} onChange={set("message")} rows={3} style={{ ...S.input, resize: "vertical", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 20px", background: "none", border: "1px solid #d8d4cc", cursor: "pointer", fontFamily: "Lato, sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999" }}>Cancel</button>
              <button onClick={submit} disabled={loading} style={{ padding: "10px 28px", background: loading ? "#999" : "#121212", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Lato, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fff" }}>
                {loading ? "Sending…" : "Submit Inquiry"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
