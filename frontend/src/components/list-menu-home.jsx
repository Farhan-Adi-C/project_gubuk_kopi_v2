"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaCartShopping } from "react-icons/fa6";
import Link from "next/link";

export default function ListMenuHome() {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/products/highlight/best");
        const data = await res.json();
        setMenus(data.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {menus.map((item, index) => (
        <div
          key={index}
          className="bg-transparent rounded-xl overflow-hidden border border-slate-300 flex flex-col"
        >
          <div className="relative h-48 w-full">
            <Image
              src={`http://127.0.0.1:8000/storage/${item.image} `}
              alt={item.name}
              fill
              className="object-cover"
            />
            {item.total_sold > 0 && (
              <div className="absolute top-2 left-2 bg-[#E2A22A] text-white px-3 py-1 rounded-full text-sm">
                Best Seller
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-700 text-sm flex-grow">{item.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[#E2A22A] font-bold text-lg">
                Rp {parseInt(item.price).toLocaleString("id-ID")}
              </span>
            </div>
            <Link
                href={`/menu/${item.slug}`}
                className="flex items-center justify-center gap-2 bg-[#E2A22A] text-white mt-3 px-4 py-2 rounded-lg hover:bg-[#d28f12] transition-colors duration-200"
                >
                Pesan <FaCartShopping />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
