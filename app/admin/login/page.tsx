"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ShieldCheck, Phone, ArrowRight, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"phone" | "email">("phone");

  // Check if already logged in as admin
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const adminRoles = ["admin", "super_admin", "farm_manager", "operations", "delivery_manager", "inventory_manager", "support"];
        if (profile?.role && adminRoles.includes(profile.role)) {
          router.replace("/admin");
        }
      }
    };
    checkSession();
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!phone || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg("Admin authentication requires Supabase configuration. Please set up environment variables.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone.slice(-10)}`,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to send OTP. Please try again.");
      } else {
        setInfoMsg(`OTP sent to +91 ${phone.slice(-10)}`);
        setStep("otp");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
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

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone.slice(-10)}`,
        token: otp,
        type: "sms",
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || "Invalid or expired OTP.");
        setLoading(false);
        return;
      }

      // Check admin role server-side
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .single();

      const adminRoles = ["admin", "super_admin", "farm_manager", "operations", "delivery_manager", "inventory_manager", "support"];
      if (!profile?.role || !adminRoles.includes(profile.role)) {
        await supabase.auth.signOut();
        setErrorMsg("Access denied. You do not have admin privileges.");
        setStep("phone");
        setLoading(false);
        return;
      }

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
      setErrorMsg("Please enter your email and password.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg("Admin authentication requires Supabase configuration.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Check admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const adminRoles = ["admin", "super_admin", "farm_manager", "operations", "delivery_manager", "inventory_manager", "support"];
      if (!profile?.role || !adminRoles.includes(profile.role)) {
        await supabase.auth.signOut();
        setErrorMsg("Access denied. You do not have admin privileges.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setErrorMsg("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
              onClick={() => { setLoginMode("phone"); setStep("phone"); setErrorMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                loginMode === "phone"
                  ? "bg-white text-[#173b27] shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Phone size={14} /> Phone OTP
            </button>
            <button
              onClick={() => { setLoginMode("email"); setErrorMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                loginMode === "email"
                  ? "bg-white text-[#173b27] shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Lock size={14} /> Email Password
            </button>
          </div>

          {!isSupabaseConfigured() && (
            <div className="mb-4 rounded-xl bg-amber-500/20 border border-amber-400/30 p-3 text-xs text-amber-200">
              ⚠️ Supabase not configured. Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable authentication.
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-500/20 p-3 text-xs text-red-300 border border-red-400/30 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 rounded-xl bg-emerald-500/20 p-3 text-xs text-emerald-300 border border-emerald-400/30">
              {infoMsg}
            </div>
          )}

          {loginMode === "phone" ? (
            <>
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
                    {loading ? "Sending..." : "Send Admin OTP"} <ArrowRight size={16} />
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
                      onClick={() => { setStep("phone"); setOtp(""); }}
                      className="text-white/50 hover:text-white font-semibold"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-[#c77828] font-bold hover:underline disabled:opacity-50"
                    >
                      Resend OTP
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
              ← Back to Store
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          🔒 This portal is for authorized personnel only. All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
