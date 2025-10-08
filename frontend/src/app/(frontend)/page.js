import Image from "next/image";
import Header from "@/components/Header";
import { Bitter } from "next/font/google";
import Footer from "@/components/Footer";
import { FaArrowRight, FaCartShopping } from "react-icons/fa6";
import { GiCoffeeBeans } from "react-icons/gi";
import { FaCoffee,FaSmile,FaTag } from "react-icons/fa";
import { BiArrowFromRight } from "react-icons/bi";


const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // sesuaikan kebutuhan
  variable: "--font-bitter", // optional, kalau mau pakai CSS variable
});

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row items-center flex-grow px-4 md:px-16 lg:px-32 gap-10 pt-28 lg:h-screen lg:items-center">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 text-left">
          <h1
            className={`${bitter.className} text-3xl font-bold md:text-5xl mb-6 leading-snug`}>
            Rasakan Hangatnya Kopi Nusantara di Tengah Desa
          </h1>
          <p className="text-gray-700 mb-6 text-base md:text-lg">
            Kopi lokal pilihan, diseduh penuh cinta, menemani obrolan hangat
            dari pagi hingga malam dengan aroma Nusantara yang memikat.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <button className="bg-[#E2A22A] text-white px-6 py-3 rounded-lg hover:bg-[#d28f12] transition-colors duration-200 w-full md:w-auto">
              Beli Sekarang
            </button>
            <button className="bg-transparent border-2 border-[#E2A22A] text-black px-6 py-3 rounded-lg hover:bg-[#E2A22A] hover:text-white transition-colors duration-200 w-full md:w-auto">
              Kontak Kami
            </button>
          </div>
        </div>

        {/* Right Side (Image + Rating Box) */}
        <div className="relative w-full lg:w-1/2 min-h-[350px] sm:min-h-[350px] md:min-h-[500px]">
          <Image
            src="/hero-image.jpg"
            alt="Hero Image"
            fill
            priority
            className="object-cover rounded-lg shadow-lg"
          />

          {/* Rating Box */}
          <div className="absolute -bottom-6 left-5 bg-[#E2A22A]/100 text-white px-4 py-4 rounded-lg w-40 flex flex-col items-center justify-center shadow-md">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-md font-semibold">4.8/5</p>
            </div>
            <p className="text-sm font-medium mt-1">Customer Rating</p>
          </div>
        </div>
      </main>
      {/* Section kenapa kami? */}
      <section className="bg-[#FAF7F2] border-t border-gray-300 py-12 text-center px-4 md:px-6 mt-10 lg:mt-0">
        <h2
          className={`${bitter.className} text-2xl md:text-4xl font-bold mb-4`}>
          Kenapa Memilih Gubuk Kopi?
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-10">
          Karena kami menyajikan kopi terbaik dari berbagai daerah di Indonesia,
          diseduh dengan teknik tradisional dan modern untuk pengalaman rasa
          yang autentik.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div
            className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center 
                    transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="bg-[#E2A22A] rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaCoffee className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Kopi Lokal Pilihan</h3>
            <p className="text-gray-700 text-center">
              Kami hanya menggunakan biji kopi terbaik dari petani lokal yang
              berkomitmen pada kualitas.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center 
                    transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="bg-[#E2A22A] rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <GiCoffeeBeans className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Resep Kopi Autentik</h3>
            <p className="text-gray-700 text-center">
              Setiap cangkir disajikan dengan resep turun-temurun yang menjaga
              keaslian cita rasa Nusantara.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center 
                    transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="bg-[#E2A22A] rounded-full w-16 h-16 flex items-center justify-center mb-4">
             <FaSmile className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pelayanan Ramah</h3>
            <p className="text-gray-700 text-center">
              Tim kami siap menyambut Anda dengan senyuman dan memberikan
              pelayanan terbaik.
            </p>
          </div>

          {/* Card 4 */}
          <div
            className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center 
                    transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="bg-[#E2A22A] rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaTag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Harga Bersahabat</h3>
            <p className="text-gray-700 text-center">
              Nikmati kualitas premium dengan harga yang ramah di kantong semua
              orang.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-10 px-4 md:px-16 lg:px-32 bg-white flex flex-col lg:flex-row-reverse items-center gap-8 md:gap-10 lg:min-h-screen">
        {/* Teks */}
        <div className="w-full lg:w-1/2 text-left">
          <h2
            className={`${bitter.className} text-[#E2A22A] text-2xl md:text-3xl lg:text-4xl font-bold mb-4`}>
            Tentang GubukKopi
          </h2>
          <p className="text-gray-700 mb-4 text-base md:text-lg leading-relaxed">
            Gubuk Kopi hadir dari semangat melestarikan kekayaan rasa Nusantara.
            Kami memilih biji kopi terbaik dari berbagai daerah, meraciknya
            dengan teknik seduh yang menjaga aroma, rasa, dan kehangatan setiap
            cangkir. Di sini, lebih dari 30 varian menu dari tubruk klasik,
            racikan rempah, hingga kreasi ice blend—siap menemani pagi santai,
            obrolan sahabat, hingga malam yang penuh cerita. Setiap tegukan
            membawa Anda menjelajahi kekayaan rasa Indonesia dalam suasana gubuk
            yang hangat dan bersahaja.
          </p>
          <button className="bg-[#E2A22A] text-white px-6 py-3 rounded-lg hover:bg-[#d28f12] transition-colors duration-200">
            Pelajari Lebih Lanjut
            <FaArrowRight className="inline ml-2" />
          </button>
        </div>

        {/* Image */}
        <div className="relative w-full lg:w-1/2 min-h-[350px] sm:min-h-[350px] md:min-h-[500px] mt-6 lg:mt-0">
          <Image
            src="/about.webp"
            alt="Hero Image"
            fill
            priority
            className="object-cover rounded-lg shadow-lg"
          />

          {/* Variant Box */}
          <div className="absolute -top-10 right-2 bg-white text-black border-1 border-black px-4 py-2 rounded-lg w-40 flex flex-col items-center justify-center shadow-md">
            <div className="flex items-center gap-1">
              <p className="text-md text-[#E2A22A] font-bold text-3xl">30+</p>
            </div>
            <p className="font-medium mt-1 text-[#E2A22A] text-base">
              Variant Menu
            </p>
          </div>
        </div>
      </section>

      {/* Menu Best Seller Section */}
      <section className="py-10 px-4 md:px-16 lg:px-32 bg-white flex flex-col items-center">
        <h2
          className={`${bitter.className} text-[#E2A22A] text-2xl md:text-4xl font-bold mb`}>
          Menu Best Seller
        </h2>
        <h3 className="text-gray-700 mb-8 text-base md:text-lg max-w-2xl text-center">
          Pilihan favorit pelanggan setia kami
        </h3>
          {/* see all button */}
        <div className="w-full flex justify-end">
          <a href="#" className="text-[#E2A22A] font-semibold mb-6 flex items-center gap-1 hover:underline">See all menu</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {/* Menu Item Card */}
          {[
            {
              name: "Kopi Tubruk Gula Aren",
              description:
                "Kopi tubruk klasik dengan sentuhan manis gula aren.",
              price: "15.000",
              image: "/menu.jpg",
            },
            {
              name: "Es Kopi Susu",
              description: "Kopi dingin dengan susu segar dan es batu.",
              price: "18.000",
              image: "/menu.jpg",
            },
            {
              name: "Kopi Rempah",
              description:
                "Kopi dengan campuran rempah pilihan untuk rasa yang unik.",
              price: "20.000",
              image: "/menu.jpg",
            },
            {
              name: "Ice Blended Mocca",
              description: "Kopi mocca dingin dengan whipped cream.",
              price: "22.000",
              image: "/menu.jpg",
            },
          ].map((item, index) => (
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
                  {item.description}
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
      </section>
      {/* Contact Section */}
      <section className="bg-white border-t border-gray-300 py-12 px-4 md:px-6 mt-10 lg:mt-0">
        <h2
          className={` ${bitter.className} text-[#E2A22A] text-2xl md:text-4xl font-bold mb-4 text-center`}>
          Hubungi Kami
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-10 text-center">
          Tinggalkan pesan atau datang langsung ke gubug kami, kami senang
          mendengar cerita Anda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Info Kontak */}
          <div className="flex flex-col gap-4">
            {/* Lokasi */}
            <div className="flex items-center gap-4 bg-white shadow-lg rounded-lg px-5 py-4">
              <div className="bg-[#D9D9D9]/40 rounded-lg w-[80px] h-[80px] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 w-9 h-9 text-black">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-lg font-medium">
                Dukuh,Sidomukti,Kota Salatiga,
              </p>
            </div>

            {/* Telepon */}
            <div className="flex items-center gap-4 bg-white shadow-lg rounded-lg px-5 py-4">
              <div className="bg-[#D9D9D9]/40 rounded-lg w-[80px] h-[80px] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-black"
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
              </div>
              <p className="text-gray-700 text-lg font-medium">
                +62 856-4155-3888
              </p>
            </div>
          </div>

          {/* Form Kontak */}
          <div className="bg-transparent border border-gray-400 rounded-lg p-6">
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Nama
                </label>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Pesan Anda"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500"></textarea>
              </div>
              <button
                type="submit"
                className="bg-transparent border border-[#E2A22A] text-[#E2A22A] hover:bg-[#E2A22A] hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
