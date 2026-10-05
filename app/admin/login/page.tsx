"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ShieldCheck, Phone, ArrowRight, AlertCircle, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "farm_manager",
  "operations",
  "delivery_manager",
  "inventory_manager",
  "support",
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "email">("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "access_denied") {
        return "Access Denied: Your account does not have administrator privileges.";
      }
    }
    return "";
  });
  const [infoMsg, setInfoMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"phone" | "email">("email");
  const [countdown, setCountdown] = useState(0);

  const isDevBypassEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ALLOW_DEV_ADMIN_BYPASS === "true";

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check session
  useEffect(() => {

    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        if (!isDevBypassEnabled) return;
        const hasDevCookie = document.cookie
          .split("; ")
          .some((c) => c.startsWith("dev_admin_session=authenticated"));
        if (hasDevCookie) {
          router.replace("/admin");
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role && ADMIN_ROLES.includes(profile.role)) {
            router.replace("/admin");
          }
        }
      } catch (err) {
        console.warn("Session check error:", err);
      }
    };
    checkSession();
  }, [router, isDevBypassEnabled]);

  const setAdminCookie = () => {
    document.cookie = "dev_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanPhone = phone.trim().replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!isSupabaseConfigured()) {
      if (!isDevBypassEnabled) {
        setErrorMsg("Phone OTP is temporarily unavailable. Please use email and password.");
        return;
      }
      setInfoMsg(`Local Development Mode: SMS simulation active for +91 ${cleanPhone}. Enter code 123456 below.`);
      setStep("otp");
      setCountdown(30);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${cleanPhone}`,
      });

      if (error) {
        setErrorMsg("Phone OTP is temporarily unavailable. Please use email and password.");
      } else {
        setInfoMsg(`OTP sent successfully to +91 ${cleanPhone}`);
        setStep("otp");
        setCountdown(30);
      }
    } catch {
      setErrorMsg("Phone OTP is temporarily unavailable. Please use email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "").slice(-10);

    // Development fallback
    if (!isSupabaseConfigured()) {
      if (!isDevBypassEnabled) {
        setErrorMsg("Supabase is not configured. Live credentials are required.");
        return;
      }
      if (otp.trim() === "123456") {
        setAdminCookie();
        router.push("/admin");
        return;
      }
      setErrorMsg("Invalid dev code. Use 123456 in development test mode.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${cleanPhone}`,
        token: otp.trim(),
        type: "sms",
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || "Invalid or expired OTP code.");
        setLoading(false);
        return;
      }

      // Check admin authorization from profiles table
      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .single();

      if (profError || !profile?.role || !ADMIN_ROLES.includes(profile.role)) {
        await supabase.auth.signOut();
        setErrorMsg(
          `Access Denied: +91 ${cleanPhone} is not registered with administrative privileges. Contact the administrator.`
        );
        setStep("phone");
        setLoading(false);
        return;
      }

      setAdminCookie();
      router.push("/admin");
    } catch {
      setErrorMsg("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your admin email and password.");
      return;
    }

    // Development fallback
    if (!isSupabaseConfigured()) {
      if (!isDevBypassEnabled) {
        setErrorMsg("Supabase is not configured. Live credentials must be set in environment variables to authenticate.");
        return;
      }
      if (email.toLowerCase().includes("admin") || password === "admin123") {
        setAdminCookie();
        router.push("/admin");
        return;
      }
      setErrorMsg("Dev mode: enter admin@palletoorisdairy.com and password admin123.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setErrorMsg("Unable to sign in. Please check your email and password.");
        setLoading(false);
        return;
      }

      // Verify admin role from database profiles table
      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profError || !profile?.role || !ADMIN_ROLES.includes(profile.role)) {
        await supabase.auth.signOut();
        setErrorMsg("Access Denied: You do not have administrator authorization.");
        setLoading(false);
        return;
      }

      setAdminCookie();
      router.push("/admin");
    } catch {
      setErrorMsg("Unable to sign in. Please check your network connection and credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    if (!isDevBypassEnabled) {
      setErrorMsg("Development admin bypass is disabled in this environment.");
      return;
    }
    setAdminCookie();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen w-full bg-[#173b27] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c77828] mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Portal</h1>
          <p className="text-sm text-white/60 mt-1">Palletoori&apos;s Dairy Farm Operations</p>
        </div>

        <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
          {/* Login Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setLoginMode("email");
                setErrorMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                loginMode === "email"
                  ? "bg-white text-[#173b27] shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Lock size={14} /> Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("phone");
                setStep("phone");
                setErrorMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                loginMode === "phone"
                  ? "bg-white text-[#173b27] shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Phone size={14} /> Phone OTP
            </button>
          </div>

          {!isSupabaseConfigured() && (
            <div className="mb-4 rounded-xl bg-amber-500/15 border border-amber-400/30 p-3.5 text-xs text-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-100">
                    {isDevBypassEnabled ? "Local Development Environment" : "Supabase Auth Configuration Required"}
                  </p>
                  <p className="mt-0.5 text-amber-200/80">
                    {isDevBypassEnabled
                      ? "Live Supabase credentials not set in .env.local. Test with dev code 123456 or click below."
                      : "Supabase credentials are not configured in environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live authentication."}
                  </p>
                  {isDevBypassEnabled && (
                    <button
                      type="button"
                      onClick={handleDevBypass}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-3 py-1.5 text-[11px] font-bold text-amber-100 hover:bg-amber-400/30 border border-amber-400/40"
                    >
                      Enter Dev Admin Mode &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-500/20 p-3 text-xs text-red-300 border border-red-400/30 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 rounded-xl bg-emerald-500/20 p-3 text-xs text-emerald-300 border border-emerald-400/30 flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {loginMode === "phone" ? (
            <>
              <div className="mb-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 p-3.5 text-xs text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-100">
                      Phone OTP is temporarily unavailable. Please use email and password.
                    </p>
                    <p className="mt-1 text-amber-200/80 leading-relaxed text-[11px]">
                      SMS OTP is currently disabled while SMS gateway credentials are being configured. Please sign in using your administrator email and password.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMode("email");
                        setErrorMsg("");
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#c77828] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#b86e22] shadow transition"
                    >
                      <Lock size={12} /> Switch to Email &amp; Password
                    </button>
                  </div>
                </div>
              </div>

              {step === "phone" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white/80 block mb-1.5">
                      Admin Mobile Number
                    </label>
                    <div className="flex items-center rounded-2xl border border-white/20 bg-white/10 px-3.5 focus-within:border-[#c77828]">
                      <span className="text-xs font-bold text-white/50 mr-2">+91</span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c77828] text-sm font-bold text-white shadow-md transition hover:bg-[#b86e22] disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Send Admin OTP"} <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-xs text-white/60 mb-4">
                    Enter the 6-digit code sent to <strong className="text-white">+91 {phone.slice(-10)}</strong>
                  </p>
                  <div>
                    <label className="text-xs font-bold text-white/80 block mb-1.5">
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                        if (pasted) setOtp(pasted);
                      }}
                      placeholder="000000"
                      className="w-full rounded-2xl border border-white/20 bg-white/10 p-3 text-center text-xl font-black tracking-widest text-white outline-none focus:border-[#c77828] placeholder:text-white/20"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c77828] text-sm font-bold text-white shadow-md transition hover:bg-[#b86e22] disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Access Dashboard"}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                      }}
                      className="text-white/50 hover:text-white font-semibold"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || countdown > 0}
                      className="text-[#c77828] font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@palletoorisdairy.com"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#c77828] placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-[#c77828] placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c77828] text-sm font-bold text-white shadow-md transition hover:bg-[#b86e22] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Access Admin Dashboard"} <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link
              href="/"
              className="text-[11px] text-white/40 hover:text-white/70"
            >
              &larr; Back to Store
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          🔒 Authorized farm operations personnel only. Access is verified against administrator roles.
        </p>
      </div>
    </div>
  );
}
