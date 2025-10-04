'use client';
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Jangan tampilkan footer di halaman login dan register
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <footer className="bg-[#3B2C20] text-white py-10 px-6 md:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand Info */}
        <div>
          <h3 className="text-xl font-bold mb-2">Gubuk Kopi</h3>
          <p className="text-gray-300 text-sm">
            Authentic Indonesian coffee experience in every cup.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-md font-semibold mb-3">Contact Info</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +62 856-4155-3888
            </li>
            <li className="flex items-center gap-2">
             <MdEmail className="h-5 w-5" />
              hello@gubukopi.id
            </li>
            <li className="flex items-center gap-2">
              <FaLocationDot className="h-5 w-5" />
              Dukuh,Sidomukti,Kota Salatiga,
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-md font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4 text-gray-300">
            <a href="#" className="hover:text-white transition-colors">
              <FaInstagram className="text-xl" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <FaFacebook className="text-xl" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <FaWhatsapp className="text-xl" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-600 mt-10 pt-4 text-center text-gray-400 text-sm">
        © 2025 Gubuk Kopi. All rights reserved.
      </div>
    </footer>
  );
}
