"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#fffdf8] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-[#c77828] mb-6 shadow-sm border border-amber-200">
          <AlertTriangle size={38} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#173b27] mb-3">
          Something went wrong
        </h1>

        <p className="text-sm text-[#52665d] leading-relaxed mb-6">
          We encountered an unexpected issue while loading this page. Our farm support team has been notified.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-gray-400 bg-gray-100 py-1.5 px-3 rounded-lg inline-block mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#173b27] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#126044] transition"
          >
            <RefreshCcw size={16} /> Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-[#173b27] hover:bg-gray-50 transition"
          >
            <Home size={16} /> Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
