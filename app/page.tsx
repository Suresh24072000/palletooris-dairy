"use client";

import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8]">

      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= HERO ================= */}
      <main id="home" className="w-full overflow-x-hidden">

        <section className="w-full overflow-hidden bg-[#f8efd9]">

          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">

            {/* BADGE */}
            <div className="mb-8 flex justify-center lg:mb-12 lg:justify-start">

              <div className="inline-flex max-w-full items-center justify-center rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-[#173b27] shadow-md sm:px-8 sm:py-4 sm:text-lg">
                ✨&nbsp; Pure. Fresh. From our farm.
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

                  <span className="text-[#c77828]">
                    comes
                  </span>

                  <br />

                  from
                  <br />

                  home.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-[#52665d] sm:mt-8 sm:text-xl sm:leading-9">
                  Fresh milk and traditional dairy products
                  made with care, delivered from Palletoori's
                  Dairy Farm directly to your home.
                </p>

                {/* BUTTONS */}
                <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">

                  <a
                    href="#products"
                    className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#126044] px-8 text-base font-bold text-white shadow-md transition hover:bg-[#0e5039] sm:w-auto sm:text-lg"
                  >
                    Shop Products
                  </a>

                  <a
                    href="#about"
                    className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border-2 border-[#126044] bg-white px-8 text-base font-bold text-[#126044] transition hover:bg-[#f3ead9] sm:w-auto sm:text-lg"
                  >
                    Explore Our Farm
                  </a>

                </div>

              </div>

              {/* ================= RIGHT VIDEO ================= */}
              <div className="flex w-full min-w-0 justify-center lg:justify-end">

                <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-black shadow-lg">

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

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= PRODUCTS ================= */}
        <section
          id="products"
          className="w-full overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8"
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
                Pure and fresh dairy products made with care.
              </p>

            </div>


            {/* PRODUCT CARDS */}
            <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              <ProductCard
                name="Fresh Milk"
                image="/milk.png"
              />

              <ProductCard
                name="Fresh Curd"
                image="/curd.png"
              />

              <ProductCard
                name="Pure Ghee"
                image="/ghee.png"
              />

              <ProductCard
                name="Fresh Butter"
                image="/butter.png"
              />

            </div>

          </div>

        </section>


        {/* ================= OUR FARM ================= */}
        <section
          id="about"
          className="w-full overflow-hidden bg-[#f8efd9] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >

          <div className="mx-auto w-full max-w-7xl">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-bold uppercase tracking-[3px] text-[#b77932]">
                Our Farm
              </p>

              <h2 className="mt-3 text-4xl font-black text-[#173b27] sm:text-5xl">
                From our farm to your home
              </h2>

              <p className="mt-6 text-lg leading-8 text-[#52665d]">
                We believe good dairy starts with healthy animals,
                quality feed and traditional care.
              </p>

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
                Why choose Palletoori's?
              </h2>

            </div>


            <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">

              <Feature
                title="Farm Fresh"
                text="Fresh dairy products delivered directly from our farm."
              />

              <Feature
                title="Pure & Natural"
                text="Made with quality ingredients and traditional care."
              />

              <Feature
                title="Delivered Fresh"
                text="Carefully packed and delivered directly to your doorstep."
              />

            </div>

          </div>

        </section>


        {/* ================= SUBSCRIPTIONS ================= */}
        <section
          id="subscription"
          className="w-full overflow-hidden bg-[#173b27] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24"
        >

          <div className="mx-auto w-full max-w-4xl text-center">

            <p className="text-sm font-bold uppercase tracking-[3px] text-[#e5b36d]">
              Subscriptions
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Fresh dairy, every day.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Subscribe to your favourite dairy products and
              get them delivered regularly to your doorstep.
            </p>

            <a
              href="#products"
              className="mt-8 inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-8 text-lg font-bold text-[#173b27] transition hover:bg-[#f3ead9]"
            >
              View Products
            </a>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="w-full overflow-hidden bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto w-full max-w-7xl text-center">

          <img
            src="/logo.png"
            alt="Palletoori's Dairy Farm"
            className="mx-auto h-auto w-[180px] object-contain"
          />

          <p className="mt-4 text-sm text-gray-500">
            Pure. Fresh. From our farm.
          </p>

          <p className="mt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} Palletoori's Dairy Farm. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  name,
  image,
}: {
  name: string;
  image: string;
}) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-black/5 bg-[#fffdf8] p-5 shadow-sm">

      <div className="flex h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f8efd9]">

        <img
          src={image}
          alt={name}
          className="h-full w-full object-contain"
        />

      </div>

      <h3 className="mt-5 text-center text-xl font-bold text-[#173b27]">
        {name}
      </h3>

    </div>
  );
}


/* =========================================================
   FEATURE
========================================================= */

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="w-full min-w-0 rounded-3xl bg-[#f8efd9] p-7 text-center">

      <h3 className="text-xl font-bold text-[#173b27]">
        {title}
      </h3>

      <p className="mt-3 text-base leading-7 text-[#52665d]">
        {text}
      </p>

    </div>
  );
}