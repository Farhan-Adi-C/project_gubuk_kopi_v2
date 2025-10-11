"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/get-token-user";
import { FaClipboardList } from "react-icons/fa";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      const token = await getAuthToken();
      if (!token) {
        if (mounted) setUser(null);
        return;
      }
      try {
        const res = await fetch("http://127.0.0.1:8000/api/userislogin", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const u = data?.data ?? data?.user ?? null;
        if (mounted) setUser(u);
      } catch (e) {
        if (mounted) setUser(null);
      }
    };
    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    try {
      const token = await getAuthToken();
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } finally {
      // hapus token di cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      setOpen(false);
      router.push("/login");
    }
  };

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/orderConfirmation")
  ) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-full mx-auto flex justify-between items-center px-4 lg:px-10 py-4 md:py-5">
          {/* Logo */}
          <div className="flex items-center font-bold">
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
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`${
                pathname === "/" ? "text-[#E67E22]" : "text-gray-700"
              } hover:text-[#E67E22]`}>
              Home
            </Link>
            <Link
              href="/menu"
              className={`${
                pathname === "/menu" ? "text-[#E67E22]" : "text-gray-700"
              } hover:text-[#E67E22]`}>
              Menu
            </Link>
            <Link
              href="/blog"
              className={`${
                pathname.startsWith("/blog")
                  ? "text-[#E67E22]"
                  : "text-gray-700"
              } hover:text-[#E67E22]`}>
              Blog
            </Link>

            {user && (
              <Link
                href="/historyOrder"
                className={`flex items-center gap-1 ${
                  pathname === "/historyOrder"
                    ? "text-[#E67E22]"
                    : "text-gray-700"
                } hover:text-[#E67E22]`}>
                <FaClipboardList className="w-5 h-5" />
              </Link>
            )}

            <Link
              href={`${user !== null ? "/cart" : "/login"}`}
              className="relative flex items-center gap-2 text-gray-700 hover:text-[#E67E22]">
              <FaShoppingCart className="text-xl" />
              <span className="absolute -top-2 -right-3 bg-[#E67E22] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                2
              </span>
            </Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <img
                    src={
                      user.avatar
                        ? `http://127.0.0.1:8000/storage/${user.avatar}`
                        : "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border border-gray-300"
                  />
                </button>
                <div className="absolute right-0  w-40 bg-white border rounded-lg shadow-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#E67E22] text-white px-4 py-2 rounded-xl hover:bg-[#cf6d13] transition-colors">
                Login
              </Link>
            )}
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden bg-gray-500/20 w-10 h-10 flex items-center justify-center rounded-full">
            {open ? (
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
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-b border-gray-300 transition-all duration-200 overflow-hidden ${
          open ? "max-h-screen" : "max-h-0"
        }`}>
        <nav className="flex flex-col">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="px-5 py-3 hover:bg-gray-100">
            Home
          </Link>
          <Link
            href="/menu"
            onClick={() => setOpen(false)}
            className="px-5 py-3 hover:bg-gray-100">
            Menu
          </Link>
          <Link
            href="/blog"
            onClick={() => setOpen(false)}
            className="px-5 py-3 hover:bg-gray-100">
            Blog
          </Link>
          {user && (
            <Link
              href="/historyOrder"
              onClick={() => setOpen(false)}
              className={`px-5 py-3 hover:bg-gray-100 ${
                pathname === "/historyOrder"
                  ? "text-[#E67E22]"
                  : "text-gray-700"
              }`}>
              Riwayat Pesanan
            </Link>
          )}
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-5 py-3 hover:bg-gray-100">
            <span>Keranjang</span>
            <span className="bg-[#E67E22] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="px-5 py-3 hover:bg-gray-100">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="text-left px-5 py-3 hover:bg-gray-100 w-full">
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-5 py-3 bg-[#E67E22] text-white text-center hover:bg-[#cf6d13] font-semibold">
              Login
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
