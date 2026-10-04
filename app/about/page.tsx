import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#f8efd9] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#173b27] shadow-sm mb-4">
                <Sparkles size={14} className="text-[#c77828]" /> Established with Village Heritage
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-[#173b27] tracking-tight">
                Goodness that comes from home.
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[#52665d] leading-relaxed">
                Palletoori&apos;s Dairy Farm was founded on a simple promise: to restore the unadulterated, wholesome taste of village dairy to Indian households.
              </p>
            </div>
          </div>
        </section>

        {/* FARM PHILOSOPHY */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#b77932]">
                Our Philosophy
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#173b27]">
                Happy Cattle, Natural Feed, Pure Milk
              </h2>
              <p className="text-base text-[#52665d] leading-relaxed">
                Modern industrial dairy often relies on confined pens, artificial hormonal stimulants (oxytocin), and powdered milk reconstitution. At Palletoori&apos;s Dairy Farm in Shamshabad, we chose the traditional path.
              </p>
              <p className="text-base text-[#52665d] leading-relaxed">
                Our indigenous cows and Murrah buffaloes roam freely on open green paddocks. They feast on organically grown green sorghum, maize, clover, and mineral-balanced fodder grown on our own farm lands.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-2xl border border-black/5 bg-[#f8efd9]/50 p-4">
                  <h4 className="font-bold text-[#173b27] text-sm">Zero Oxytocin</h4>
                  <p className="text-xs text-gray-500 mt-1">No artificial lactation hormones ever injected</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#f8efd9]/50 p-4">
                  <h4 className="font-bold text-[#173b27] text-sm">4°C Chill Chain</h4>
                  <p className="text-xs text-gray-500 mt-1">Chilled within 60 mins to halt bacterial growth</p>
                </div>
              </div>
            </div>

            {/* VIDEO CARD */}
            <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
              <video
                src="/dairy-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </section>

        {/* BILONA PROCESS */}
        <section className="bg-[#173b27] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#e5b36d]">
                Ancient Vedic Tradition
              </p>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black">
                The Authentic 5-Step Bilona Ghee Method
              </h2>
              <p className="mt-4 text-base text-white/80">
                Unlike commercial ghee made from artificial industrial cream, our pure ghee is crafted following centuries-old Vedic recipes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  step: "01",
                  title: "Fresh Raw Milk",
                  desc: "Whole milk milked from our grass-fed cows and buffaloes.",
                },
                {
                  step: "02",
                  title: "Boiling & Curdling",
                  desc: "Boiled gently over earthenware and cultured into whole curd.",
                },
                {
                  step: "03",
                  title: "Wooden Bilona",
                  desc: "Hand-churned back-and-forth using traditional wooden bilona.",
                },
                {
                  step: "04",
                  title: "White Makkhan",
                  desc: "Unsalted pure farm butter separated naturally from buttermilk.",
                },
                {
                  step: "05",
                  title: "Woodfire Simmer",
                  desc: "Slowly clarified over gentle cow-dung firewood for aroma.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between"
                >
                  <span className="text-3xl font-black text-[#e5b36d] mb-4">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/products/traditional-bilona-ghee"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#173b27] shadow hover:bg-[#f8efd9]"
              >
                Order Pure Danedar Bilona Ghee <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* QUALITY TESTS */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#b77932]">
              Rigorous Lab Certification
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#173b27]">
              Every Morning Batch Tested
            </h2>
            <p className="mt-2 text-sm text-[#52665d]">
              Our in-house farm quality testing lab examines every batch before bottling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-sm">
              <span className="text-3xl">🧪</span>
              <h4 className="mt-3 text-base font-bold text-[#173b27]">Zero Urea &amp; Starch</h4>
              <p className="mt-1 text-xs text-gray-500">Tested to ensure zero chemical adulteration</p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-sm">
              <span className="text-3xl">🔬</span>
              <h4 className="mt-3 text-base font-bold text-[#173b27]">Zero Detergents</h4>
              <p className="mt-1 text-xs text-gray-500">Guaranteed pure fat without synthetic foamers</p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-sm">
              <span className="text-3xl">💧</span>
              <h4 className="mt-3 text-base font-bold text-[#173b27]">No Added Water</h4>
              <p className="mt-1 text-xs text-gray-500">Strict lactometer density checks on every drop</p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-sm">
              <span className="text-3xl">🛡️</span>
              <h4 className="mt-3 text-base font-bold text-[#173b27]">FSSAI Registered</h4>
              <p className="mt-1 text-xs text-gray-500">Compliant with highest food safety norms</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
