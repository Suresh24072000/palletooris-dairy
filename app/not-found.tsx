import Link from "next/link";
import { Milk, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#fffdf8] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f8efd9]">
          <Milk size={48} className="text-[#126044]" />
        </div>

        {/* 404 */}
        <p className="text-7xl font-black text-[#173b27] leading-none mb-2">404</p>
        <h1 className="text-2xl font-black text-[#173b27] mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[#52665d] leading-relaxed mb-8">
          Oops! It looks like this page has been moved or doesn&apos;t exist. 
          Let&apos;s get you back to our fresh dairy products.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#126044] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#0e5039] transition"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#126044]/30 bg-white px-6 py-3 text-sm font-bold text-[#126044] shadow-sm hover:bg-[#f8efd9] transition"
          >
            View Products
          </Link>
        </div>

        {/* Farm badge */}
        <p className="mt-8 text-xs text-[#52665d]/50 font-medium">
          🌿 Palletoori&apos;s Dairy Farm — Pure. Fresh. From our farm.
        </p>
      </div>
    </div>
  );
}
