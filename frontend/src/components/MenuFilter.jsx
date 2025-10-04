"use client";
import Image from "next/image";
import { useState } from "react";
import { FaCartShopping } from "react-icons/fa6";

export default function MenuFilter() {
  const menu = [
    {
      id: 1,
      category: "Coffee",
      name: "Espresso",
      desc: "Kopi hitam pekat dengan rasa kuat.",
      price: "15.000",
      image: "/menu.jpg",
      tag: "Coffee",
    },
    {
      id: 2,
      category: "Coffee",
      name: "Cappuccino",
      desc: "Espresso dengan susu berbusa.",
      price: "20.000",
      image: "/menu.jpg",
      tag: "Coffee",
    },
    {
      id: 3,
      category: "Ice Blend",
      name: "Mocha Ice Blend",
      desc: "Kopi, cokelat, dan es krim.",
      price: "25.000",
      image: "/menu.jpg",
      tag: "Ice Blend",
    },
    {
      id: 4,
      category: "Ice Blend",
      name: "Caramel Ice Blend",
      desc: "Kopi dengan saus karamel dan es krim.",
      price: "25.000",
      image: "/menu.jpg",
      tag: "Ice Blend",
    },
    {
      id: 4,
      category: "Hot Tea",
      name: " Tea Tarik",
      desc: "Teh susu khas Indonesia.",
      price: "25.000",
      image: "/menu.jpg",
      tag: "Hot Tea",
    },
  ];

  const categories = ["All", ...new Set(menu.map((item) => item.category))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter menu sesuai kategori
  const filteredMenu =
    selectedCategory === "All"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  return (
    <>
      {/* Filter */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1 rounded-full border border-gray-300 text-sm  ${
              selectedCategory === category
                ? "bg-[#E2A22A] text-white border-none hover:bg-[#d28f12]"
                : "hover:bg-gray-100"
            }`}>
            {category}
          </button>
        ))}
      </div>    

      <hr className="mb-6"/>

      {/* Menu Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5 lg:px-20">
        {filteredMenu.map((item,index) => (
          <div
            key={index}
            className="bg-transparent rounded-xl  overflow-hidden border border-slate-300 flex flex-col">
            <div className="relative h-48 w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#E2A22A] text-white px-3 py-1 rounded-full text-sm">
                Best Seller
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-700 text-sm flex-grow">
                {item.desc}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[#E2A22A] font-bold text-lg">
                  Rp {item.price}
                </span>
              </div>
              <button className="bg-[#E2A22A] text-white mt-3 px-4 py-2 rounded-lg hover:bg-[#d28f12] transition-colors duration-200">
                Pesan
                {/* Bisa tambahkan icon keranjang di sini jika mau */}
                <FaCartShopping className="inline ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
