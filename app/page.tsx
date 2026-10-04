"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { INITIAL_PRODUCTS } from "@/lib/data/mockData";
import { Sparkles, CheckCircle2, ArrowRight, Droplets } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts =
    selectedCategory === "all"
      ? INITIAL_PRODUCTS
      : INITIAL_PRODUCTS.filter((p) => {
          if (selectedCategory === "milk") return p.category === "Fresh Milk";
          if (selectedCategory === "curd") return p.category === "Curd & Buttermilk";
          if (selectedCategory === "ghee") return p.category === "Ghee & Butter";
          if (selectedCategory === "paneer") return p.category === "Fresh Paneer";
          if (selectedCategory === "shakes") return p.category === "Farm Milkshakes";
          return true;
        });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= HERO ================= */}
      <main id="home" className="w-full overflow-x-hidden flex-1">
        <section className="w-full overflow-hidden bg-[#f8efd9]">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
            {/* BADGE */}
            <div className="mb-8 flex justify-center lg:mb-12 lg:justify-start">
              <div className="inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-[#173b27] shadow-md sm:px-8 sm:py-4 sm:text-lg">
                <Sparkles size={18} className="text-[#c77828]" />
                Pure. Fresh. From our farm.
              </div>
            </div>

            {/* HERO GRID */}
            <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* ================= LEFT CONTENT ================= */}
              <div className="w-full min-w-0">
                <h1
                  className="
                    max-w-full
                    text-[48px]
                    font-black
                    leading-[0.95]
                    tracking-[-2px]
                    text-[#173b27]
                    sm:text-[64px]
                    lg:text-[88px]
                  "
                >
                  Goodness
                  <br />
                  that
                  <br />
                  <span className="text-[#c77828]">comes</span>
                  <br />
                  from
                  <br />
                  home.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-[#52665d] sm:mt-8 sm:text-xl sm:leading-9">
                  Fresh milk and traditional dairy products made with care, delivered from Palletoori&apos;s Dairy Farm directly to your home.
                </p>

                {/* BUTTONS */}
                <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                  <a
                    href="#products"
                    className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#126044] px-8 text-base font-bold text-white shadow-md transition hover:bg-[#0e5039] sm:w-auto sm:text-lg"
                  >
                    Shop Products
                  </a>

                  <Link
                    href="/about"
                    className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border-2 border-[#126044] bg-white px-8 text-base font-bold text-[#126044] transition hover:bg-[#f3ead9] sm:w-auto sm:text-lg"
                  >
                    Explore Our Farm
                  </Link>
                </div>

                {/* TRUST ICONS */}
                <div className="mt-8 flex flex-wrap items-center gap-6 pt-6 border-t border-black/10 text-xs font-semibold text-[#173b27]/80">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#126044]" /> 100% Raw &amp; Natural
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#126044]" /> No Preservatives
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#126044]" /> Doorstep 6-9 AM Delivery
                  </span>
                </div>
              </div>

              {/* ================= RIGHT VIDEO ================= */}
              <div className="flex w-full min-w-0 justify-center lg:justify-end">
                <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-black shadow-2xl ring-4 ring-white/50">
                  <video
                    className="
                      block
                      aspect-[4/3]
                      h-auto
                      w-full
                      object-cover
                      rounded-[28px]
                    "
                    src="/dairy-video.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/60 backdrop-blur-md p-3 text-white">
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <Droplets size={14} className="text-[#e5b36d]" /> Sourced Fresh Every Morning
                    </p>
                    <p className="text-[11px] text-gray-300">
                      Watch our happy cattle at Palletoori&apos;s Farm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRODUCTS SECTION ================= */}
        <section
          id="products"
          className="w-full overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[3px] text-[#b77932]">
                Our Products
              </p>

              <h2 className="mt-3 text-4xl font-black text-[#173b27] sm:text-5xl">
                Fresh from our farm
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Pure, traditional dairy products made with meticulous care and zero adulteration.
              </p>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-[#173b27] text-white shadow"
                    : "bg-[#f8efd9] text-[#173b27] hover:bg-[#ebdcc0]"
                }`}
              >
                All Products ({INITIAL_PRODUCTS.length})
              </button>
              <button
                onClick={() => setSelectedCategory("milk")}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === "milk"
                    ? "bg-[#173b27] text-white shadow"
                    : "bg-[#f8efd9] text-[#173b27] hover:bg-[#ebdcc0]"
                }`}
              >
                Fresh Milk
              </button>
              <button
                onClick={() => setSelectedCategory("curd")}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === "curd"
                    ? "bg-[#173b27] text-white shadow"
                    : "bg-[#f8efd9] text-[#173b27] hover:bg-[#ebdcc0]"
                }`}
              >
                Curd &amp; Buttermilk
              </button>
              <button
                onClick={() => setSelectedCategory("ghee")}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === "ghee"
                    ? "bg-[#173b27] text-white shadow"
                    : "bg-[#f8efd9] text-[#173b27] hover:bg-[#ebdcc0]"
                }`}
              >
                Ghee &amp; Butter
              </button>
              <button
                onClick={() => setSelectedCategory("paneer")}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === "paneer"
                    ? "bg-[#173b27] text-white shadow"
                    : "bg-[#f8efd9] text-[#173b27] hover:bg-[#ebdcc0]"
                }`}
              >
                Paneer
              </button>
              <button
                onClick={() => setSelectedCategory("shakes")}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === "shakes"
                    ? "bg-[#173b27] text-white shadow"
                    : "bg-[#f8efd9] text-[#173b27] hover:bg-[#ebdcc0]"
                }`}
              >
                Milkshakes
              </button>
            </div>

            {/* PRODUCT CARDS GRID */}
            <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* VIEW ALL CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#173b27] px-8 py-3.5 text-sm font-bold text-[#173b27] transition hover:bg-[#173b27] hover:text-white"
              >
                View Full Dairy Catalog <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= SUBSCRIPTION BANNER ================= */}
        <section
          id="subscription"
          className="w-full overflow-hidden bg-[#173b27] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24 relative"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-[#126044]/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-[#c77828]/20 blur-3xl" />

          <div className="relative mx-auto w-full max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[3px] text-[#e5b36d]">
              Daily Milk Subscription
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl lg:text-6xl">
              Fresh dairy, every day.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Never run out of pure milk again. Subscribe to your favourite dairy products and get them delivered regularly to your doorstep before 9:00 AM.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-white/90">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2">
                ✓ Pause or Resume anytime
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2">
                ✓ No minimum lock-in
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2">
                ✓ Free morning delivery
              </span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/subscriptions"
                className="inline-flex min-h-[56px] w-full sm:w-auto items-center justify-center rounded-full bg-white px-8 text-lg font-bold text-[#173b27] transition hover:bg-[#f8efd9] shadow-lg"
              >
                Start Daily Subscription
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-[56px] w-full sm:w-auto items-center justify-center rounded-full border border-white/30 px-8 text-lg font-bold text-white transition hover:bg-white/10"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>

        {/* ================= OUR FARM ================= */}
        <section
          id="about"
          className="w-full overflow-hidden bg-[#f8efd9] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-[3px] text-[#b77932]">
                  Our Farm
                </p>

                <h2 className="mt-3 text-4xl font-black text-[#173b27] sm:text-5xl">
                  From our farm to your home
                </h2>

                <p className="mt-6 text-lg leading-8 text-[#52665d]">
                  We believe good dairy starts with healthy animals, quality feed, and traditional village care. At Palletoori&apos;s Dairy Farm, our cows and buffaloes roam freely on open green pastures and feed on organically grown sorghum, maize, and mineral-rich fodder.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173b27] text-white">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-[#173b27]">No Hormones or Synthetic Antibiotics</h4>
                      <p className="text-sm text-gray-600">Our cattle receive zero oxytocin or synthetic yield boosters. Milk is 100% natural.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173b27] text-white">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-[#173b27]">Automated Milking &amp; Rapid Chilling</h4>
                      <p className="text-sm text-gray-600">Milk is untouched by human hands and chilled to 4°C within 60 minutes to maintain pristine purity.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173b27] text-white">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-[#173b27]">Authentic Vedic Bilona Ghee</h4>
                      <p className="text-sm text-gray-600">Prepared by culturing curd and slow wood-fire churning for medicinal aroma and danedar texture.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-base font-bold text-[#126044] hover:underline"
                  >
                    Read our complete farm story <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              {/* FARM HIGHLIGHT CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5 text-center">
                  <span className="text-3xl">🌿</span>
                  <h4 className="mt-3 text-lg font-bold text-[#173b27]">100% Grass-Fed</h4>
                  <p className="mt-1 text-xs text-gray-500">Natural green fodder cultivated on our own acreage</p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5 text-center">
                  <span className="text-3xl">🏺</span>
                  <h4 className="mt-3 text-lg font-bold text-[#173b27]">Clay Pot Fermentation</h4>
                  <p className="mt-1 text-xs text-gray-500">Live active gut-friendly cultures in all curds</p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5 text-center">
                  <span className="text-3xl">🥛</span>
                  <h4 className="mt-3 text-lg font-bold text-[#173b27]">Whole Raw Milk</h4>
                  <p className="mt-1 text-xs text-gray-500">Never diluted with water or reconstituted with powder</p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5 text-center">
                  <span className="text-3xl">❄️</span>
                  <h4 className="mt-3 text-lg font-bold text-[#173b27]">Cold Chain Delivery</h4>
                  <p className="mt-1 text-xs text-gray-500">Insulated transit vehicles ensuring freshness</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY US ================= */}
        <section
          id="why-us"
          className="w-full overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[3px] text-[#b77932]">
                Why Us
              </p>

              <h2 className="mt-3 text-4xl font-black text-[#173b27] sm:text-5xl">
                Why choose Palletoori&apos;s?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
                Experience the authentic village taste of purity and nutrition every single morning.
              </p>
            </div>

            <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
              <Feature
                icon="🌾"
                title="Farm Fresh"
                text="Fresh dairy products milked and delivered directly from our farm within hours."
              />

              <Feature
                icon="🌱"
                title="Pure & Natural"
                text="Zero chemicals, zero adulteration, made with pure ingredients and traditional care."
              />

              <Feature
                icon="🚚"
                title="Delivered Fresh"
                text="Carefully packed in insulated containers and delivered reliably to your doorstep."
              />
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="w-full min-w-0 rounded-3xl bg-[#f8efd9] p-8 text-center transition-all duration-300 hover:shadow-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[#173b27]">{title}</h3>
      <p className="mt-3 text-base leading-7 text-[#52665d]">{text}</p>
    </div>
  );
}