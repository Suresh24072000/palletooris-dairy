import Link from "next/link";
import { ShieldCheck, Truck, Clock, Sparkles, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-[#fffdf8] text-[#173b27]">
      {/* VALUE HIGHLIGHTS BANNER */}
      <div className="border-b border-black/5 bg-[#f8efd9]/60 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#126044]">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">100% Farm Pure</p>
              <p className="text-xs text-gray-500">Unadulterated & natural</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#126044]">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Chilled in 2 Hours</p>
              <p className="text-xs text-gray-500">Milked fresh twice daily</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#126044]">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Morning 6-9 AM Delivery</p>
              <p className="text-xs text-gray-500">Reliable doorstep arrival</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-[#126044]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">FSSAI Certified</p>
              <p className="text-xs text-gray-500">Rigorous lab batch tests</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Palletoori's Dairy Farm"
                className="h-auto w-[210px] object-contain"
              />
            </Link>
            <p className="text-sm font-bold text-[#b77932] tracking-wider uppercase">
              Pure. Fresh. From our farm.
            </p>
            <p className="text-sm leading-6 text-[#52665d] max-w-sm">
              We bring the wholesome goodness of traditional Indian dairy directly from our village farm to your family table. No chemicals, no powders, just uncompromised nutrition.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="rounded-full bg-[#f8efd9] px-3 py-1 text-xs font-semibold text-[#173b27]">
                🌿 Grass-Fed Cows
              </span>
              <span className="rounded-full bg-[#f8efd9] px-3 py-1 text-xs font-semibold text-[#173b27]">
                🏺 Bilona Method
              </span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#173b27] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-[#52665d] hover:text-[#173b27] transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/subscriptions" className="text-[#52665d] hover:text-[#173b27] transition">
                  Daily Milk Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#52665d] hover:text-[#173b27] transition">
                  Our Village Farm Story
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="text-[#52665d] hover:text-[#173b27] transition">
                  Why Choose Palletoori&apos;s
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#52665d] hover:text-[#173b27] transition">
                  Cart &amp; Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* CUSTOMER CARE */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#173b27] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/orders" className="text-[#52665d] hover:text-[#173b27] transition">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-[#52665d] hover:text-[#173b27] transition">
                  Account &amp; Addresses
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#52665d] hover:text-[#173b27] transition">
                  Support &amp; Inquiries
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-[#126044] font-semibold hover:underline">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#173b27] mb-4">
              Farm &amp; Dispatch
            </h4>
            <div className="space-y-3 text-sm text-[#52665d]">
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="shrink-0 text-[#b77932] mt-0.5" />
                <span>Palletoori&apos;s Dairy Farm, Shamshabad Rural, Hyderabad, Telangana 501218</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-[#b77932]" />
                <a href="tel:+919876543210" className="hover:text-[#173b27] font-semibold">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-[#b77932]" />
                <a href="mailto:contact@palletoorisdairy.com" className="hover:text-[#173b27]">
                  contact@palletoorisdairy.com
                </a>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hello%20Palletoori's%20Dairy%20Farm,%20I%20would%20like%20to%20order%20fresh%20milk."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#126044] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#0e5039]"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 border-t border-black/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Palletoori&apos;s Dairy Farm. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Accepted Payments: UPI • Cards • Net Banking • COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
