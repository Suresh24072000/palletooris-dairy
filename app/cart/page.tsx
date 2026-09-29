"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type CartItem = {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCart();
    setLoaded(true);

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      setCartItems([]);
      return;
    }

    try {
      const cart: CartItem[] = JSON.parse(savedCart);

      /*
        This also protects old cart data that doesn't have quantity.
        Old items automatically become quantity 1.
      */
      const fixedCart = cart.map((item) => ({
        ...item,
        quantity:
          typeof item.quantity === "number" && item.quantity > 0
            ? item.quantity
            : 1,
      }));

      setCartItems(fixedCart);

      localStorage.setItem("cart", JSON.stringify(fixedCart));
    } catch {
      setCartItems([]);
    }
  };

  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQuantity = (id: number) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCart(updatedCart);
  };

  const decreaseQuantity = (id: number) => {
    const updatedCart = cartItems
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(
      (item) => item.id !== id
    );

    saveCart(updatedCart);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f8fdf8] flex items-center justify-center">
        <p className="text-lg text-gray-500">
          Loading cart...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fdf8] text-[#17251d] px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Your Cart
            </h1>

            <p className="text-gray-500 mt-2">
              {totalQuantity}{" "}
              {totalQuantity === 1 ? "item" : "items"} in your cart
            </p>

          </div>

          <Link
            href="/"
            className="text-[#0f4b32] font-semibold hover:underline"
          >
            ← Continue Shopping
          </Link>

        </div>

        {/* EMPTY CART */}
        {cartItems.length === 0 ? (

          <div className="bg-white rounded-3xl p-16 text-center shadow-sm">

            <div className="text-7xl mb-5">
              🛒
            </div>

            <h2 className="text-3xl font-bold mb-3">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mb-8">
              Add some fresh products from our farm.
            </p>

            <Link
              href="/"
              className="inline-block bg-[#0f4b32] text-white px-8 py-4 rounded-full font-semibold"
            >
              Shop Products
            </Link>

          </div>

        ) : (

          <div className="grid lg:grid-cols-3 gap-8">

            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-5">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
                >

                  {/* IMAGE */}
                  <div className="relative w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-[#f4efe4] flex-shrink-0">

                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />

                  </div>

                  {/* DETAILS */}
                  <div className="flex-1">

                    <h2 className="text-2xl font-bold">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {item.unit}
                    </p>

                    <p className="text-[#b8752a] font-bold text-xl mt-3">
                      ₹{item.price} each
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-xl"
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-bold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-9 h-9 rounded-full bg-[#0f4b32] text-white hover:bg-[#0b3d28] font-bold text-xl"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  {/* ITEM TOTAL */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">

                    <p className="text-2xl font-bold">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-white rounded-3xl p-7 shadow-sm h-fit lg:sticky lg:top-6">

              <h2 className="text-2xl font-bold mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between mb-4">

                <span className="text-gray-600">
                  Items
                </span>

                <span className="font-semibold">
                  {totalQuantity}
                </span>

              </div>

              <div className="flex justify-between mb-4">

                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-semibold">
                  ₹{total}
                </span>

              </div>

              <div className="flex justify-between mb-5">

                <span className="text-gray-600">
                  Delivery
                </span>

                <span className="text-green-700 font-semibold">
                  Free
                </span>

              </div>

              <hr className="mb-5" />

              <div className="flex justify-between text-xl font-bold">

                <span>
                  Total
                </span>

                <span className="text-[#b8752a]">
                  ₹{total}
                </span>

              </div>

              <button
                onClick={() =>
                  alert("Checkout coming soon!")
                }
                className="w-full mt-7 bg-[#0f4b32] hover:bg-[#0b3d28] text-white py-4 rounded-full font-bold text-lg"
              >
                Proceed to Checkout
              </button>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}