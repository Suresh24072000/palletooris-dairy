"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const cartCount = 0;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fffdf8]">

      {/* ANNOUNCEMENT */}
      <div className="w-full bg-[#173b27] px-2 py-2 text-center text-[11px] font-medium text-white sm:px-4 sm:text-sm">
        🌿 Farm fresh dairy delivered to your doorstep
      </div>

      {/* MAIN HEADER */}
      <div className="w-full border-b border-black/5 bg-[#fffdf8]">
        <div className="mx-auto flex h-[82px] w-full items-center px-3 sm:h-20 sm:px-5 lg:max-w-7xl lg:px-8">

          {/* LOGO */}
          <a
            href="#home"
            onClick={closeMenu}
            className="flex min-w-0 flex-1 items-center overflow-hidden"
          >
            <img
              src="/logo.png"
              alt="Palletoori's Dairy Farm"
              className="block h-auto w-[145px] max-w-full object-contain sm:w-[190px] lg:w-[245px]"
            />
          </a>

          {/* ACTIONS */}
          <div className="ml-2 flex shrink-0 items-center gap-2">

            {/* SEARCH */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm sm:h-11 sm:w-11"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* USER */}
            <button
              type="button"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm sm:flex sm:h-11 sm:w-11"
              aria-label="Account"
            >
              <User size={19} />
            </button>

            {/* CART */}
            <button
              type="button"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#173b27] text-white shadow-sm sm:h-11 sm:w-11"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d88935] px-1 text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm lg:hidden sm:h-11 sm:w-11"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* DESKTOP NAV */}
      <nav className="hidden h-[66px] w-full items-center justify-center gap-8 border-b border-black/10 bg-white lg:flex">
        <a
          href="#home"
          className="font-semibold text-[#173b27] hover:text-[#b77932]"
        >
          Home
        </a>

        <a
          href="#products"
          className="font-semibold text-gray-600 hover:text-[#173b27]"
        >
          Products
        </a>

        <a
          href="#about"
          className="font-semibold text-gray-600 hover:text-[#173b27]"
        >
          Our Farm
        </a>

        <a
          href="#why-us"
          className="font-semibold text-gray-600 hover:text-[#173b27]"
        >
          Why Us
        </a>

        <a
          href="#subscription"
          className="font-semibold text-gray-600 hover:text-[#173b27]"
        >
          Subscriptions
        </a>
      </nav>

      {/* SEARCH */}
      {searchOpen && (
        <div className="w-full border-b border-black/5 bg-white px-3 py-3">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3">

            <Search size={18} className="shrink-0 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milk, curd, butter..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              autoFocus
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="shrink-0"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="w-full border-b border-black/5 bg-white px-4 py-4 shadow-lg lg:hidden">

          <nav className="flex flex-col gap-1">

            <a
              href="#home"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-[#173b27] hover:bg-[#f3ead9]"
            >
              Home
            </a>

            <a
              href="#products"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-[#173b27] hover:bg-[#f3ead9]"
            >
              Products
            </a>

            <a
              href="#about"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-[#173b27] hover:bg-[#f3ead9]"
            >
              Our Farm
            </a>

            <a
              href="#why-us"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-[#173b27] hover:bg-[#f3ead9]"
            >
              Why Us
            </a>

            <a
              href="#subscription"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-[#173b27] hover:bg-[#f3ead9]"
            >
              Subscriptions
            </a>

          </nav>
        </div>
      )}

    </header>
  );
}