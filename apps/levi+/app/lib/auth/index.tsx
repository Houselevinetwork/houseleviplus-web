"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User { id: string; email: string; firstName?: string; lastName?: string; isPremium?: boolean; subscriptionStatus?: string; [key: string]: any; }
interface AuthCtx { user: User | null; isAuthenticated: boolean; isLoading: boolean; logout: () => Promise<void>; }
const AuthContext = createContext<AuthCtx>({ user: null, isAuthenticated: false, isLoading: false, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    try { const u = localStorage.getItem("user"); if (u) setUser(JSON.parse(u)); } catch {}
    setIsLoading(false);
  }, []);
  const logout = async () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };
  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() { return useContext(AuthContext); }

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com'";

export function useAuth() {
  const [step, setStep] = useState<"email"|"otp"|"signup">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/check-email`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      if (data.action === "signup" || !data.exists) { setStep("signup"); return; }
      const otpRes = await fetch(`${API_URL}/auth/otp-request`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email, purpose:"login"}) });
      const otpData = await otpRes.json();
      if (!otpRes.ok) { setError(otpData.error || "Failed to send OTP"); return; }
      setStep("otp"); setCountdown(otpData.canResendIn || 60);
    } catch(err:any) { setError(err.message || "Failed to check email"); }
    finally { setLoading(false); }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp-verify`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email, otp}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid code"); return; }
      if (data.accessToken) localStorage.setItem("token", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch(err:any) { setError(err.message || "Verification failed"); }
    finally { setLoading(false); }
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/request-signup`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send verification email"); return; }
      window.location.href = "/";
    } catch(err:any) { setError(err.message || "Failed to request verification"); }
    finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp-request`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email, purpose:"login"}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to resend code"); return; }
      setCountdown(data.canResendIn || 60);
    } catch(err:any) { setError(err.message || "Failed to resend code"); }
    finally { setLoading(false); }
  };

  const backToEmail = () => { setStep("email"); setOtp(""); setError(null); };

  return { step, email, setEmail, otp, setOtp, loading, error, countdown, handleEmailSubmit, handleOTPSubmit, handleSignupRequest, handleResendOTP, backToEmail };
}