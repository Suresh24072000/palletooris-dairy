"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Phone,
  Milk,
  Calendar,
  Package,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { INITIAL_PRODUCTS } from "@/lib/data/mockData";
import { FARM_CONTACT } from "@/lib/config/contact";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Prevent SSR/client hydration mismatch for auth-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive auth state only after hydration
  const isLoggedIn = mounted && isAuthenticated;
  const currentUser = mounted ? user : null;

  // Close menus when route changes
  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Derived search results without cascading effect
  const searchResults = search.trim()
    ? INITIAL_PRODUCTS.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
        );
      })
    : [];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Our Farm", href: "/about" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Subscriptions", href: "/subscriptions" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fffdf8] shadow-sm">
      {/* ANNOUNCEMENT */}
      <div className="w-full bg-[#173b27] px-3 py-2 text-center text-[11px] sm:text-sm font-medium text-white sm:px-4 tracking-wide">
        🌿 Farm fresh dairy delivered to your doorstep daily before 9 AM
      </div>

      {/* MAIN HEADER BAR */}
      <div className="w-full border-b border-black/5 bg-[#fffdf8]">
        <div className="mx-auto flex h-[72px] sm:h-20 w-full max-w-7xl items-center justify-between px-2.5 min-[360px]:px-4 sm:px-6 lg:px-8">
          {/* LOGO */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-1.5 overflow-hidden focus:outline-none shrink"
            aria-label="Palletoori's Dairy Farm Home"
          >
            <Image
              src="/logo.png"
              alt="Palletoori's Dairy Farm"
              width={230}
              height={60}
              className="block h-auto w-[115px] min-[360px]:w-[138px] sm:w-[195px] lg:w-[230px] max-w-full object-contain"
              style={{ height: "auto" }}
              priority
            />
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? "text-[#b77932] border-b-2 border-[#b77932] pb-1"
                      : "text-[#173b27] hover:text-[#b77932]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* ACTION BUTTONS (MOBILE & DESKTOP) */}
          <div className="flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 sm:gap-3">
            {/* SEARCH TOGGLE */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#173b27] shadow-sm transition hover:bg-[#f8efd9] focus:outline-none touch-manipulation"
              aria-label="Search products"
            >
              <Search size={18} />
            </button>

            {/* USER / PROFILE ACCOUNT (VISIBLE AT ALL BREAKPOINTS) */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push("/login");
                  } else {
                    // On mobile screens, navigate directly to profile
                    if (typeof window !== "undefined" && window.innerWidth < 640) {
                      router.push("/profile");
                    } else {
                      setUserDropdownOpen(!userDropdownOpen);
                    }
                  }
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#173b27] shadow-sm transition hover:bg-[#f8efd9] focus:outline-none touch-manipulation"
                aria-label="Account"
              >
                <User size={19} />
              </button>

              {/* User Dropdown for Desktop */}
              {userDropdownOpen && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-xl z-50">
                  <div className="border-b border-black/5 px-3 py-2">
                    <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-[#173b27] truncate">
                      {currentUser?.fullName || `+91 ${currentUser?.phone}`}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#173b27] hover:bg-[#f8efd9]"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#173b27] hover:bg-[#f8efd9]"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Package size={16} />
                      My Orders
                    </Link>
                    <Link
                      href="/subscriptions"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#173b27] hover:bg-[#f8efd9]"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Calendar size={16} />
                      Subscriptions
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#126044] hover:bg-[#eaf4ef]"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      Admin Dashboard
                    </Link>
                  </div>
                  <div className="border-t border-black/5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CART BUTTON */}
            <Link
              href="/cart"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#173b27] text-white shadow-sm transition hover:bg-[#126044] focus:outline-none touch-manipulation"
              aria-label={`Shopping cart with ${totalCount} items`}
            >
              <ShoppingCart size={18} />
              {totalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c77828] px-1 text-[11px] font-bold text-white shadow">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#173b27] shadow-sm transition lg:hidden hover:bg-[#f8efd9] focus:outline-none touch-manipulation"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & QUICK RESULTS */}
      {searchOpen && (
        <div className="w-full border-b border-black/10 bg-white px-4 py-4 shadow-md transition-all">
          <div className="mx-auto max-w-3xl">
            <div className="flex w-full items-center gap-3 rounded-2xl border border-[#173b27]/20 bg-[#fffdf8] px-4 py-3 shadow-inner">
              <Search size={20} className="shrink-0 text-[#173b27]/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fresh milk, curd, bilona ghee, paneer..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#173b27] placeholder:text-gray-400 outline-none"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="rounded-full p-1 text-gray-400 hover:text-black"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {search.trim().length > 0 && (
              <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-black/5 bg-[#fffdf8] p-2 shadow-lg">
                {searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-center text-sm text-gray-500">
                    No dairy products found matching &quot;{search}&quot;.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between rounded-xl p-2.5 transition hover:bg-[#f8efd9]"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                          />
                          <div>
                            <p className="text-sm font-bold text-[#173b27]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#b77932]">
                            ₹{product.variants[0]?.price}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            /{product.variants[0]?.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="w-full border-b border-black/10 bg-[#fffdf8] px-4 py-5 shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition ${
                    isActive
                      ? "bg-[#173b27] text-white"
                      : "text-[#173b27] hover:bg-[#f8efd9]"
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight size={18} className="opacity-50" />
                </Link>
              );
            })}

            <div className="my-2 border-t border-black/10 pt-2" />

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center rounded-2xl bg-[#f8efd9] p-3 text-center transition hover:bg-[#edd8b4]"
              >
                <Package size={20} className="text-[#173b27]" />
                <span className="mt-1 text-xs font-bold text-[#173b27]">My Orders</span>
              </Link>
              <Link
                href="/subscriptions"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center rounded-2xl bg-[#f8efd9] p-3 text-center transition hover:bg-[#edd8b4]"
              >
                <Calendar size={20} className="text-[#173b27]" />
                <span className="mt-1 text-xs font-bold text-[#173b27]">Daily Milk Plan</span>
              </Link>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <div className="rounded-2xl border border-black/10 bg-white p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-[#173b27] truncate">
                        {currentUser?.fullName || `+91 ${currentUser?.phone}`}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-[#173b27] px-4 py-2 text-xs font-bold text-white min-h-[44px] inline-flex items-center justify-center hover:bg-[#126044]"
                    >
                      View Profile
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 min-h-[44px]"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#126044] font-bold text-white transition hover:bg-[#0e5039]"
                >
                  Login / Sign Up with Mobile
                </Link>
              )}

              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#173b27]/20 py-2.5 text-xs font-semibold text-[#173b27] hover:bg-[#f8efd9]"
              >
                <ShieldCheck size={16} />
                Admin Operations
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
              <a
                href={FARM_CONTACT.TEL_HREF}
                className="flex items-center gap-1.5 hover:text-[#173b27]"
              >
                <Phone size={14} /> {FARM_CONTACT.PHONE_DISPLAY}
              </a>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Milk size={14} /> FSSAI Certified
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}