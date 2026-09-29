"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {

  const [cartCount, setCartCount] = useState(0);

  // Read cart
  useEffect(() => {

    const updateCartCount = () => {

      const savedCart = localStorage.getItem("cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      try {

        const cart = JSON.parse(savedCart);

        if (Array.isArray(cart)) {
          setCartCount(cart.length);
        } else {
          setCartCount(0);
        }

      } catch {
        setCartCount(0);
      }

    };

    updateCartCount();

    // Custom event from Add to Cart
    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );
    };

  }, []);

  return (
    <>

      {/* TOP ANNOUNCEMENT */}
      <div className="bg-[#15543f] text-white text-center py-3 font-serif">
        🌿 &nbsp; Farm fresh dairy delivered to your doorstep
      </div>

      {/* HEADER */}
      <header className="bg-[#fffdf9] border-b border-gray-200">

        <div className="max-w-[1700px] mx-auto px-6">

          <div className="h-[145px] flex items-center">

            {/* LOGO */}
            <Link
              href="/"
              className="flex-shrink-0"
            >

              <Image
                src="/logo.png"
                alt="Palletoori's Dairy Farm"
                width={270}
                height={140}
                priority
                className="w-[270px] h-[140px] object-contain"
              />

            </Link>

            {/* NAVIGATION */}
            <nav className="flex-1 flex justify-center gap-12 text-lg font-semibold text-[#174936]">

              <Link
                href="/"
                className="hover:text-[#b66c28] transition"
              >
                Home
              </Link>

              <Link
                href="/#products"
                className="hover:text-[#b66c28] transition"
              >
                Products
              </Link>

              <Link
                href="/#our-farm"
                className="hover:text-[#b66c28] transition"
              >
                Our Farm
              </Link>

              <Link
                href="/#why-us"
                className="hover:text-[#b66c28] transition"
              >
                Why Us
              </Link>

              <Link
                href="/#subscriptions"
                className="hover:text-[#b66c28] transition"
              >
                Subscriptions
              </Link>

            </nav>

            {/* RIGHT ICONS */}
            <div className="flex items-center gap-5">

              {/* SEARCH */}
              <button
                className="w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center text-2xl hover:bg-gray-50"
                aria-label="Search"
              >
                🔍
              </button>

              {/* USER */}
              <button
                className="w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center text-2xl hover:bg-gray-50"
                aria-label="Account"
              >
                👤
              </button>

              {/* CART */}
              <Link
                href="/cart"
                className="h-14 px-6 rounded-full bg-[#15543f] text-white flex items-center gap-3 font-semibold text-lg hover:bg-[#103f30] transition"
              >

                <span className="text-2xl">
                  🛒
                </span>

                <span>
                  Cart
                </span>

                <span className="bg-[#d58a3a] text-white min-w-[30px] h-[30px] px-2 rounded-full flex items-center justify-center text-sm font-bold">
                  {cartCount}
                </span>

              </Link>

            </div>

          </div>

        </div>

      </header>

    </>
  );
}