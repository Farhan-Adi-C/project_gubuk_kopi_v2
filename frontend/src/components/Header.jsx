"use client";
import { useState } from "react";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-300">
      {/* Header Section */}
      <header className="w-full flex justify-between items-center mb-8 relative pt-5 px-5">
        {/* Logo */}
        <div className="font-bold flex items-center ">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-auto rounded-full md:h-12"
          />
          <span className="ml-2 hidden md:inline text-lg md:text-2xl">
            Gubuk Kopi
          </span>
        </div>
        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-7 md:items-center">
          <Link href="#" className="text-gray-700 hover:text-[#E67E22]">
            Home
          </Link>
          <Link href="#" className="text-gray-700 hover:text-[#E67E22]">
            Menu
          </Link>
          <Link href="#" className="text-gray-700 hover:text-[#E67E22]">
            Blog
          </Link>

          {/* Keranjang */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-[#E67E22] flex items-center gap-2">
            <FaShoppingCart className="text-xl" />
            <span>Keranjang</span>

            {/* Badge jumlah item */}
            <span className="absolute -top-2 -right-3 bg-[#E67E22] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {/* Login */}
          <Link
            href="/login"
            className="bg-[#E67E22] text-white px-4 py-2 rounded-xl 
       hover:bg-[#cf6d13] transition-colors duration-200">
            Login
          </Link>
        </nav>
        {/* Hamburger Icon (mobile only) */}
        <div className="bg-gray-500/20 rounded-full p-2 md:hidden w-10 h-10 flex items-center justify-center">
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-700 focus:outline-none opacity-100"
            aria-label="Toggle menu">
            {open ? (
              // Close (X) icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
   
        {/* Mobile Dropdown */}
        <div
          className={`absolute top-full left-0 w-full bg-white rounded-lg shadow-lg origin-top transform transition-all duration-300 ease-out md:hidden 
    ${
      open
        ? "scale-y-100 opacity-100"
        : "scale-y-0 opacity-0 pointer-events-none"
    }`}>
          <Link
            href="#"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link
            href="#"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}>
            Menu
          </Link>
          <Link
            href="#"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}>
            Blog
          </Link>

          {/* Keranjang */}
          <Link
            href="/cart"
            className=" px-4 py-3 flex items-center gap-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}>
            <FaShoppingCart className="text-lg" />
            <span>Cart</span>

            {/* Badge jumlah item */}
            <span className="ml-auto bg-[#E67E22] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {/* Login */}
          <Link
            href="/login"
            className="block px-4 py-3 font-semibold text-center text-white bg-[#E67E22] hover:bg-[#d2691e] rounded-b-lg transition-colors"
            onClick={() => setOpen(false)}>
            Login
          </Link>
        </div>
      </header>
    </div>
  );
}
