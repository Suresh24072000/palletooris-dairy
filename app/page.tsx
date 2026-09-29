"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Variant = {
  size: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  image: string;
  description: string;
  variants: Variant[];
};

type CartItem = {
  id: number;
  name: string;
  image: string;
  description: string;
  size: string;
  price: number;
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Fresh Milk",
    image: "/milk.png",
    description:
      "Pure and fresh farm milk delivered directly to your doorstep.",
    variants: [
      { size: "500 ml", price: 60 },
      { size: "1 L", price: 90 },
    ],
  },

  {
    id: 2,
    name: "Paneer",
    image: "/Paneer.png",
    description:
      "Soft, fresh paneer made from pure farm milk.",
    variants: [
      { size: "200 g", price: 120 },
      { size: "500 g", price: 280 },
      { size: "1 kg", price: 520 },
    ],
  },

  {
    id: 3,
    name: "Butter",
    image: "/Butter.png",
    description:
      "Creamy and delicious traditional dairy butter.",
    variants: [
      { size: "200 g", price: 110 },
      { size: "500 g", price: 260 },
      { size: "1 kg", price: 500 },
    ],
  },

  {
    id: 4,
    name: "Curd",
    image: "/Curd.png",
    description:
      "Thick, creamy and naturally delicious farm-fresh curd.",
    variants: [
      { size: "500 g", price: 60 },
      { size: "1 kg", price: 100 },
    ],
  },

  {
    id: 5,
    name: "Buttermilk",
    image: "/Buttermilk.png",
    description:
      "Refreshing traditional buttermilk made from fresh dairy.",
    variants: [
      { size: "200 ml", price: 25 },
      { size: "500 ml", price: 40 },
      { size: "1 L", price: 70 },
    ],
  },

  {
    id: 6,
    name: "Ghee",
    image: "/Ghee.png",
    description:
      "Pure traditional cow ghee with rich aroma and taste.",
    variants: [
      { size: "250 ml", price: 180 },
      { size: "500 ml", price: 340 },
      { size: "1 L", price: 650 },
    ],
  },
];

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});

  const [notification, setNotification] = useState("");

  /* --------------------------------
     LOAD CART COUNT
  -------------------------------- */

  const updateCartCount = () => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart: CartItem[] = JSON.parse(savedCart);

      const total = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );
    };
  }, []);

  /* --------------------------------
     SELECT PRODUCT SIZE
  -------------------------------- */

  const selectVariant = (
    productId: number,
    variantIndex: number
  ) => {
    setSelectedVariants((previous) => ({
      ...previous,
      [productId]: variantIndex,
    }));
  };

  /* --------------------------------
     ADD TO CART
  -------------------------------- */

  const addToCart = (product: Product) => {
    const variantIndex =
      selectedVariants[product.id] ?? 0;

    const selectedVariant =
      product.variants[variantIndex];

    let cart: CartItem[] = [];

    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        cart = JSON.parse(savedCart);
      }
    } catch {
      cart = [];
    }

    /*
      Same product + same size
      = increase quantity
    */

    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === product.id &&
        item.size === selectedVariant.size
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        description: product.description,
        size: selectedVariant.size,
        price: selectedVariant.price,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    window.dispatchEvent(new Event("cartUpdated"));

    setNotification(
      `${product.name} (${selectedVariant.size}) added to cart`
    );

    setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#f8f0df] text-[#174f3c]">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <div className="bg-[#14553f] text-white text-center py-3 text-lg">
        🌿 Farm fresh dairy delivered to your doorstep
      </div>

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="bg-white border-b border-[#eee3cf] sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-6">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center shrink-0"
          >
            <img
              src="/logo.png"
              alt="Palletoori's Dairy"
              className="h-24 w-auto object-contain"
            />
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center gap-10 text-lg font-semibold">

            <Link
              href="/"
              className="hover:text-[#bd742c] transition"
            >
              Home
            </Link>

            <a
              href="#products"
              className="hover:text-[#bd742c] transition"
            >
              Products
            </a>

            <a
              href="#farm"
              className="hover:text-[#bd742c] transition"
            >
              Our Farm
            </a>

            <a
              href="#why-us"
              className="hover:text-[#bd742c] transition"
            >
              Why Us
            </a>

            <a
              href="#subscriptions"
              className="hover:text-[#bd742c] transition"
            >
              Subscriptions
            </a>

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-4">

            <button
              className="w-14 h-14 rounded-full border border-gray-200 bg-white text-2xl shadow-sm"
              aria-label="Search"
            >
              🔍
            </button>

            <button
              className="w-14 h-14 rounded-full border border-gray-200 bg-white text-2xl shadow-sm"
              aria-label="Account"
            >
              👤
            </button>

            <Link
              href="/cart"
              className="bg-[#14553f] text-white rounded-full px-6 py-4 flex items-center gap-3 font-semibold shadow-md hover:bg-[#0f4533] transition"
            >
              🛒
              <span>Cart</span>

              <span className="bg-[#d88a38] text-white min-w-7 h-7 rounded-full flex items-center justify-center text-sm px-2">
                {cartCount}
              </span>
            </Link>

          </div>

        </div>

      </header>

      {/* =====================================
          MOBILE NAV
      ===================================== */}

      <div className="md:hidden bg-white border-b px-5 py-3 overflow-x-auto">
        <div className="flex gap-6 whitespace-nowrap text-sm font-semibold">

          <a href="#products">Products</a>

          <a href="#farm">Our Farm</a>

          <a href="#why-us">Why Us</a>

          <a href="#subscriptions">
            Subscriptions
          </a>

        </div>
      </div>

      {/* =====================================
          HERO SECTION
      ===================================== */}

      <section
        id="home"
        className="max-w-7xl mx-auto px-5 py-16 md:py-20"
      >

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 bg-white rounded-full px-7 py-4 shadow-md text-lg font-semibold mb-8">
              ✨ Pure. Fresh. From our farm.
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.95]">
              Goodness that
              <br />

              <span className="text-[#bd742c]">
                comes from
              </span>

              <br />

              home.
            </h1>

            <p className="mt-8 text-xl text-[#4d5e57] max-w-xl leading-relaxed">
              Fresh milk and traditional dairy products made
              with care, delivered from Palletoori&apos;s Dairy
              Farm directly to your home.
            </p>

            <div className="mt-10 flex gap-4 flex-wrap">

              <a
                href="#products"
                className="bg-[#14553f] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#0e4533] transition"
              >
                Shop Products
              </a>

              <a
                href="#farm"
                className="bg-white border border-[#14553f] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#eef5ec] transition"
              >
                Explore Our Farm
              </a>

            </div>

          </div>

          {/* VIDEO */}

          <div className="bg-[#dfead5] rounded-[50px] p-6 md:p-10 shadow-sm">

            <div className="rounded-[40px] overflow-hidden bg-white aspect-square">

              <video
                className="w-full h-full object-cover"
                src="/dairy-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          PRODUCTS
      ===================================== */}

      <section
        id="products"
        className="bg-[#f4ead8] py-20 scroll-mt-24"
      >

        <div className="max-w-7xl mx-auto px-5">

          <div className="text-center mb-14">

            <p className="text-[#bd742c] font-semibold text-lg">
              FROM OUR FARM
            </p>

            <h2 className="text-5xl md:text-6xl font-serif font-bold mt-2">
              Fresh Dairy Products
            </h2>

            <p className="text-gray-600 text-lg mt-5">
              Choose your favourite product and select
              the quantity you need.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {products.map((product) => {

              const selectedIndex =
                selectedVariants[product.id] ?? 0;

              const selectedVariant =
                product.variants[selectedIndex];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition"
                >

                  {/* IMAGE */}

                  <div className="bg-[#f5f0e6] h-80 flex items-center justify-center p-5">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />

                  </div>

                  {/* CONTENT */}

                  <div className="p-7">

                    <div className="flex justify-between items-start gap-4">

                      <h3 className="text-2xl font-serif font-bold">
                        {product.name}
                      </h3>

                      <span className="text-2xl font-bold text-[#bd742c]">
                        ₹{selectedVariant.price}
                      </span>

                    </div>

                    <p className="text-gray-500 mt-2">
                      {product.description}
                    </p>

                    {/* SIZE OPTIONS */}

                    <div className="mt-5">

                      <p className="font-semibold mb-3">
                        Select quantity:
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {product.variants.map(
                          (variant, index) => (

                            <button
                              key={variant.size}
                              onClick={() =>
                                selectVariant(
                                  product.id,
                                  index
                                )
                              }
                              className={`px-4 py-2 rounded-full border font-medium transition ${
                                selectedIndex === index
                                  ? "bg-[#14553f] text-white border-[#14553f]"
                                  : "bg-white text-[#14553f] border-gray-300 hover:border-[#14553f]"
                              }`}
                            >
                              {variant.size}
                            </button>

                          )
                        )}

                      </div>

                    </div>

                    {/* ADD BUTTON */}

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full mt-6 bg-[#14553f] text-white py-4 rounded-full font-semibold text-lg hover:bg-[#0e4533] transition"
                    >
                      Add to Cart
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================
          OUR FARM
      ===================================== */}

      <section
        id="farm"
        className="py-24 bg-[#eef4e8] scroll-mt-24"
      >

        <div className="max-w-7xl mx-auto px-5">

          <div className="grid md:grid-cols-2 gap-14 items-center">

            <div>

              <p className="text-[#bd742c] font-semibold text-lg">
                OUR FARM
              </p>

              <h2 className="text-5xl md:text-6xl font-serif font-bold mt-3">
                Straight from our farm to your home.
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mt-7">
                At Palletoori&apos;s Dairy Farm, we believe that
                great dairy products begin with healthy animals,
                clean surroundings and genuine care.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed mt-5">
                Our dairy products are prepared with attention
                to freshness, quality and traditional taste so
                that your family can enjoy goodness every day.
              </p>

              <div className="grid grid-cols-2 gap-5 mt-8">

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-3xl">🐄</div>
                  <h3 className="font-bold mt-3">
                    Farm Fresh
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fresh dairy straight from our farm.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-3xl">🥛</div>
                  <h3 className="font-bold mt-3">
                    Pure Dairy
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Quality products for your family.
                  </p>
                </div>

              </div>

            </div>

            <div className="rounded-[40px] overflow-hidden bg-white shadow-lg">

              <video
                className="w-full aspect-video object-cover"
                src="/dairy-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          WHY US
      ===================================== */}

      <section
        id="why-us"
        className="py-24 bg-white scroll-mt-24"
      >

        <div className="max-w-7xl mx-auto px-5">

          <div className="text-center max-w-3xl mx-auto mb-14">

            <p className="text-[#bd742c] font-semibold text-lg">
              WHY US
            </p>

            <h2 className="text-5xl md:text-6xl font-serif font-bold mt-3">
              Why choose Palletoori&apos;s?
            </h2>

            <p className="text-gray-600 text-lg mt-5">
              We keep things simple — fresh products,
              quality ingredients and dependable delivery.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="rounded-3xl bg-[#f7f1e5] p-8 text-center">

              <div className="text-5xl">
                🥛
              </div>

              <h3 className="text-xl font-bold mt-5">
                Fresh Every Day
              </h3>

              <p className="text-gray-600 mt-3">
                Dairy products prepared with freshness
                as our priority.
              </p>

            </div>

            <div className="rounded-3xl bg-[#eef5e9] p-8 text-center">

              <div className="text-5xl">
                🌱
              </div>

              <h3 className="text-xl font-bold mt-5">
                Natural Goodness
              </h3>

              <p className="text-gray-600 mt-3">
                Simple, traditional dairy goodness for
                your family.
              </p>

            </div>

            <div className="rounded-3xl bg-[#f7f1e5] p-8 text-center">

              <div className="text-5xl">
                ❤️
              </div>

              <h3 className="text-xl font-bold mt-5">
                Made With Care
              </h3>

              <p className="text-gray-600 mt-3">
                Every product is handled with attention
                and care.
              </p>

            </div>

            <div className="rounded-3xl bg-[#eef5e9] p-8 text-center">

              <div className="text-5xl">
                🏠
              </div>

              <h3 className="text-xl font-bold mt-5">
                Doorstep Delivery
              </h3>

              <p className="text-gray-600 mt-3">
                Get your favourite dairy products
                delivered to your home.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          SUBSCRIPTIONS
      ===================================== */}

      <section
        id="subscriptions"
        className="py-24 bg-[#f4ead8] scroll-mt-24"
      >

        <div className="max-w-7xl mx-auto px-5">

          <div className="text-center mb-14">

            <p className="text-[#bd742c] font-semibold text-lg">
              SUBSCRIPTIONS
            </p>

            <h2 className="text-5xl md:text-6xl font-serif font-bold mt-3">
              Fresh dairy, delivered regularly.
            </h2>

            <p className="text-gray-600 text-lg mt-5">
              Choose a plan that fits your family&apos;s needs.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-7">

            {/* DAILY */}

            <div className="bg-white rounded-3xl p-8 shadow-md">

              <div className="text-4xl">
                🥛
              </div>

              <h3 className="text-3xl font-serif font-bold mt-5">
                Daily Fresh
              </h3>

              <p className="text-gray-600 mt-3">
                Fresh milk delivered to your doorstep
                every day.
              </p>

              <ul className="mt-6 space-y-3 text-gray-700">

                <li>✓ Daily milk delivery</li>
                <li>✓ Fresh farm milk</li>
                <li>✓ Convenient doorstep service</li>

              </ul>

              <button
                className="w-full mt-8 bg-[#14553f] text-white py-4 rounded-full font-semibold"
                onClick={() =>
                  setNotification(
                    "Daily Fresh subscription selected"
                  )
                }
              >
                Subscribe Now
              </button>

            </div>

            {/* WEEKLY */}

            <div className="bg-[#14553f] text-white rounded-3xl p-8 shadow-xl transform md:-translate-y-3">

              <div className="inline-block bg-[#d88a38] text-white px-4 py-2 rounded-full text-sm font-semibold">
                POPULAR
              </div>

              <div className="text-4xl mt-5">
                🏡
              </div>

              <h3 className="text-3xl font-serif font-bold mt-5">
                Family Plan
              </h3>

              <p className="text-white/80 mt-3">
                A convenient plan for families who love
                fresh dairy products.
              </p>

              <ul className="mt-6 space-y-3">

                <li>✓ Regular milk delivery</li>
                <li>✓ Dairy products available</li>
                <li>✓ Convenient ordering</li>

              </ul>

              <button
                className="w-full mt-8 bg-white text-[#14553f] py-4 rounded-full font-semibold"
                onClick={() =>
                  setNotification(
                    "Family Plan subscription selected"
                  )
                }
              >
                Subscribe Now
              </button>

            </div>

            {/* CUSTOM */}

            <div className="bg-white rounded-3xl p-8 shadow-md">

              <div className="text-4xl">
                📦
              </div>

              <h3 className="text-3xl font-serif font-bold mt-5">
                Custom Plan
              </h3>

              <p className="text-gray-600 mt-3">
                Build a dairy delivery plan according
                to your requirements.
              </p>

              <ul className="mt-6 space-y-3 text-gray-700">

                <li>✓ Choose your products</li>
                <li>✓ Choose quantities</li>
                <li>✓ Flexible delivery</li>

              </ul>

              <button
                className="w-full mt-8 bg-[#14553f] text-white py-4 rounded-full font-semibold"
                onClick={() =>
                  setNotification(
                    "Custom Plan selected"
                  )
                }
              >
                Get Started
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          CALL TO ACTION
      ===================================== */}

      <section className="py-20 bg-[#14553f] text-white">

        <div className="max-w-5xl mx-auto px-5 text-center">

          <h2 className="text-5xl md:text-6xl font-serif font-bold">
            Bring farm-fresh goodness home.
          </h2>

          <p className="text-white/80 text-xl mt-5">
            Fresh dairy products from Palletoori&apos;s Dairy
            Farm, delivered to your doorstep.
          </p>

          <a
            href="#products"
            className="inline-block mt-8 bg-white text-[#14553f] px-9 py-4 rounded-full font-bold text-lg hover:bg-[#f4ead8] transition"
          >
            Shop Now
          </a>

        </div>

      </section>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="bg-[#0d3c2d] text-white py-12">

        <div className="max-w-7xl mx-auto px-5">

          <div className="grid md:grid-cols-3 gap-10">

            <div>

              <img
                src="/logo.png"
                alt="Palletoori's Dairy"
                className="h-24 w-auto bg-white rounded-lg p-2"
              />

              <p className="text-white/70 mt-5 max-w-sm">
                Fresh dairy products made with care and
                delivered from our farm to your home.
              </p>

            </div>

            <div>

              <h3 className="text-xl font-bold">
                Quick Links
              </h3>

              <div className="flex flex-col gap-3 mt-5 text-white/70">

                <a href="#products">
                  Products
                </a>

                <a href="#farm">
                  Our Farm
                </a>

                <a href="#why-us">
                  Why Us
                </a>

                <a href="#subscriptions">
                  Subscriptions
                </a>

              </div>

            </div>

            <div>

              <h3 className="text-xl font-bold">
                Palletoori&apos;s Dairy
              </h3>

              <p className="text-white/70 mt-5">
                Pure. Fresh. From our farm.
              </p>

              <p className="text-white/70 mt-3">
                🐄 Farm Fresh Dairy
              </p>

              <p className="text-white/70 mt-2">
                🥛 Fresh Milk & Dairy Products
              </p>

            </div>

          </div>

          <div className="border-t border-white/20 mt-10 pt-6 text-center text-white/50">

            © {new Date().getFullYear()} Palletoori&apos;s
            Dairy Farm. All rights reserved.

          </div>

        </div>

      </footer>

      {/* =====================================
          CART NOTIFICATION
      ===================================== */}

      {notification && (

        <div className="fixed bottom-6 right-6 z-[100] bg-[#14553f] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">

          <div className="text-2xl">
            ✓
          </div>

          <div>
            <p className="font-semibold">
              Added to Cart
            </p>

            <p className="text-sm text-white/80">
              {notification}
            </p>
          </div>

          <Link
            href="/cart"
            className="bg-white text-[#14553f] px-4 py-2 rounded-full text-sm font-semibold"
          >
            View Cart
          </Link>

        </div>

      )}

    </main>
  );
}