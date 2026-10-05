"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/context/AuthContext";
import { ArrowRight, AlertCircle, Phone, Lock } from "lucide-react";

// TODO: Enable production SMS OTP after Twilio/alternative SMS provider configuration is completed.

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const { sendOtp, verifyOtp, signInWithEmail } = useAuth();

  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!phone || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);

    if (res.success) {
      setInfoMsg(res.message);
      setStep("otp");
    } else {
      setErrorMsg(res.message);
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
    const res = await verifyOtp(phone, otp);
    setLoading(false);

    if (res.success) {
      router.push(nextParam || "/profile");
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      router.push(nextParam || "/profile");
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-3">
              <img
                src="/logo.png"
                alt="Palletoori's Dairy Farm"
                className="h-10 mx-auto object-contain"
              />
            </Link>
            <h1 className="text-2xl font-black text-[#173b27]">
              {authMode === "email"
                ? "Sign in with Email"
                : step === "phone"
                ? "Login to Palletoori's"
                : "Verify Mobile Number"}
            </h1>
            <p className="mt-1 text-xs text-[#52665d]">
              {authMode === "email"
                ? "Enter your account email and password to access your profile and orders"
                : step === "phone"
                ? "Enter your mobile number to view orders, daily milk subscriptions & addresses"
                : `Enter the 6-digit verification code sent to +91 ${phone.slice(-10)}`}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode("phone");
                setErrorMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                authMode === "phone"
                  ? "bg-white text-[#173b27] shadow"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <Phone size={14} /> Mobile Number
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("email");
                setErrorMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                authMode === "email"
                  ? "bg-white text-[#173b27] shadow"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <Lock size={14} /> Email & Password
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              {infoMsg}
            </div>
          )}

          {authMode === "email" ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 text-sm text-[#173b27] outline-none focus:border-[#126044]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 text-sm text-[#173b27] outline-none focus:border-[#126044]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126044] text-sm font-bold text-white shadow-md transition hover:bg-[#0e5039] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In with Email"} <ArrowRight size={16} />
              </button>
            </form>
          ) : step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-2xl border border-black/10 bg-[#fffdf8] px-3.5 focus-within:border-[#126044]">
                  <span className="text-xs font-bold text-gray-500 mr-2">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full bg-transparent py-3 text-sm text-[#173b27] outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126044] text-sm font-bold text-white shadow-md transition hover:bg-[#0e5039] disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Get OTP via SMS"} <ArrowRight size={16} />
              </button>

              <div className="pt-4 text-center">
                <p className="text-[11px] text-gray-400">
                  🔒 Fast &amp; secure OTP verification. No password required.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-center text-lg font-black tracking-widest text-[#173b27] outline-none focus:border-[#126044]"
                  autoFocus
                />
                {process.env.NODE_ENV === "development" && (
                  <p className="text-[10px] text-gray-400 text-center mt-1">
                    Development test code: <strong className="text-gray-600">123456</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126044] text-sm font-bold text-white shadow-md transition hover:bg-[#0e5039] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-gray-500 hover:text-black font-semibold"
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#126044] font-bold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-black/5 pt-4 text-center">
            <Link
              href="/admin"
              className="text-[11px] text-gray-400 hover:text-[#173b27] underline"
            >
              Farm Administrator Portal &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
          <p className="text-gray-500 font-bold animate-pulse">Loading login...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

