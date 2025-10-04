"use client";
import { Bitter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaTrash, FaCreditCard, FaTruck } from "react-icons/fa6";
import { TbShoppingCartX } from "react-icons/tb";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // sesuaikan kebutuhan
  variable: "--font-bitter", // optional, kalau mau pakai CSS variable
});


export default function Cart() {
  const [cart, setCart] = useState([
    { id: 1, name: "Kopi Tubruk", price: 10000, qty: 1, image: "/menu.jpg" },
    { id: 2, name: "Kopi Coklat", price: 10000, qty: 1, image: "/menu.jpg" },
    { id: 3, name: "Kopi Rempah", price: 10000, qty: 1, image: "/menu.jpg" },
  ]);

  const incrementQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decrementQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  let shipping = 10000;
  let total = subtotal + shipping;

  if (subtotal >= 100000) {
    shipping = 0;
    total = subtotal;
  }

  return (
    <div className="max-w-full bg-[#F7F3F0] min-h-screen">
      {/* Header */}
      <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
        <h2 className={` ${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>
          Keranjang Belanja
        </h2>
        <p className="text-gray-600">
          Periksa kembali item sebelum lanjut ke pembayaran.
        </p>
      </div>

      <div className="max-w-4xl lg:max-w-full lg:px-20 mx-auto p-5 flex flex-col lg:flex-row gap-8">
        {cart.length === 0 ? (
          // Empty Cart
          <div className="flex flex-col items-center justify-center w-full py-20 gap-4">
            <TbShoppingCartX className="text-6xl text-gray-400" />
            <p className="text-gray-500 text-lg text-center">
              Keranjang belanja Anda kosong. <br />
              Tambahkan item untuk melanjutkan.
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 lg:w-1/2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#fdfdfd] rounded-lg shadow-lg p-3 gap-3">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Name & Price */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-[#E67E22] font-medium">
                      Rp {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-2 border rounded-md px-2 py-1">
                    <button
                      onClick={() => decrementQty(item.id)}
                      className="px-2 py-1 rounded hover:bg-gray-200 transition">
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => incrementQty(item.id)}
                      className="px-2 py-1 rounded hover:bg-gray-200 transition">
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 text-lg">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/2 flex flex-col gap-6">
              {/* Address */}
              <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                <label className="block mb-2 font-medium">
                  Alamat Pengiriman
                </label>
                <textarea
                  placeholder="Jl..."
                  className="w-full border rounded-md p-3 focus:outline-[#E67E22]"
                  rows={3}></textarea>
              </div>

              {/* Summary */}
              <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Biaya Ongkir</span>
                  <span>Rp {shipping.toLocaleString()}</span>
                </div>
                <hr className="my-3 text-[#000000]/20" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>

                <button className="w-full mt-5 bg-[#E67E22] text-white py-3 rounded-lg hover:bg-[#cf6d13] transition">
                  <FaCreditCard className="inline mr-2" />
                  Lanjut ke Pembayaran
                </button>
                <Link
                  href="/menu"
                  className="block w-full mt-3 bg-transparent text-[#E2A22A] hover:text-white border-[#E2A22A] border-2 py-3 rounded-lg hover:bg-[#cf6d13] transition text-center">
                  Kembali Belanja
                </Link>
                <div className="flex flex-col mt-4 bg-[#FFF4E5] text-[#E67E22] rounded-lg p-4 gap-1 text-sm">
                    <div className="flex items-center mb-1">
                        <FaTruck className="inline mr-2 text-lg" />
                        <p className="text-black font-semibold">Gratis ongkir </p>
                    </div>
                    <div>
                        <p className="text-[#8B4513]">Dengan Minimal Pembelian Rp 100.000 dan maksimal 5KM</p>
                    </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
