"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaCartShopping } from "react-icons/fa6";
import Link from "next/link";

export default function MenuFilter() {
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch menu dari API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((res) => setMenu(res.data))
      .catch((err) => console.error(err));
  }, []);

  const categories = ["All", ...new Set(menu.map((item) => item.category.name))];

  const filteredMenu =
    selectedCategory === "All"
      ? menu
      : menu.filter((item) => item.category.name === selectedCategory);

  return (
    <>
      {/* Filter */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1 rounded-full border border-gray-300 text-sm ${
              selectedCategory === category
                ? "bg-[#E2A22A] text-white border-none hover:bg-[#d28f12]"
                : "hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <hr className="mb-6" />

      {/* Menu Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5 lg:px-20">
        {filteredMenu.map((item) => {
          const finalPrice =
            item.discount > 0
              ? item.price * (1 - item.discount / 100)
              : item.price;

          return (
            <div
              key={item.id}
              className="bg-transparent rounded-xl overflow-hidden border border-slate-300 flex flex-col"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={`http://127.0.0.1:8000/storage/${item.image}`}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {/* Label Best Seller */}
                {!item.bestSeller && (
                  <div className="absolute top-2 left-2 bg-[#E2A22A] text-white px-3 py-1 rounded-full text-sm">
                    Best Seller
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-700 text-sm flex-grow">{item.description}</p>
                
                {/* Harga */}
                <div className="mt-4 flex items-center gap-2">
                  {item.discount > 0 && (
                    <span className="line-through text-gray-400">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="text-[#E2A22A] font-bold text-lg">
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <Link href={`/menu/${item.slug}`} className="bg-[#E2A22A] text-white mt-3 px-4 py-2 rounded-lg hover:bg-[#d28f12] transition-colors duration-200 flex items-center justify-center gap-2">
                  Pesan <FaCartShopping />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
