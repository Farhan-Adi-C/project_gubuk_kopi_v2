"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { Bitter } from "next/font/google";
import Footer from "@/components/Footer";
import { FaArrowRight, FaCartShopping, FaLeaf } from "react-icons/fa6";
import { GiCoffeeBeans } from "react-icons/gi";
import { FaCoffee, FaSmile, FaTag } from "react-icons/fa";
import { BiArrowFromRight } from "react-icons/bi";
import ListMenuHome from "@/components/list-menu-home";
import Link from "next/link";
import FormContact from "@/components/form-contact";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";


const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], 
  variable: "--font-bitter", 
});

export default function Home() {

    useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row items-center flex-grow px-4 md:px-16 lg:px-32 gap-10 pt-28 lg:h-screen lg:items-center">
        {/* Left Side */}
        <div
          className="w-full lg:w-1/2 text-left"
          data-aos="fade-up"
          data-aos-delay="200">
          <div
            className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-[#E2A22A] to-[#E67E22] hover:from-[#E67E22] hover:to-[#E2A22A] transition-all duration-300 text-white/90 font-medium text-sm px-4 py-2 rounded-full mb-4 shadow-sm border border-[#E2A22A]/20 backdrop-blur-sm"
            data-aos="zoom-in"
            data-aos-delay="100">
            <FaLeaf className="text-white/90" />
            <span className="font-semibold">Kopi Asli Nusantara</span>
            <span className="text-white/80">— Sejak 2019</span>
          </div>

          <h1
            className={`${bitter.className} text-3xl font-bold md:text-5xl mb-6 leading-snug`}
            data-aos="fade-right"
            data-aos-delay="300">
            Rasakan Hangatnya Kopi Nusantara di Tengah Desa
          </h1>

          <p
            className="text-gray-700 mb-6 text-base md:text-lg"
            data-aos="fade-right"
            data-aos-delay="400">
            Kopi lokal pilihan, diseduh penuh cinta, menemani obrolan hangat
            dari pagi hingga malam dengan aroma Nusantara yang memikat.
          </p>

          <div
            className="flex flex-col md:flex-row gap-3"
            data-aos="fade-up"
            data-aos-delay="500">
            <Link
              href={"/menu"}
              className="bg-[#E2A22A] text-white px-6 py-3 rounded-lg hover:bg-[#d28f12] transition-colors duration-200 w-full md:w-auto flex items-center justify-center">
              Beli Sekarang
            </Link>
            <a
              href="#contact"
              className="bg-transparent border-2 border-[#E2A22A] text-black px-6 py-3 rounded-lg hover:bg-[#d28f12] hover:text-white transition-colors duration-200 w-full md:w-auto flex items-center justify-center">
              Kontak Kami
            </a>
          </div>
        </div>

        {/* Right Side (Image + Rating Box) */}
        <div
          className="relative w-full lg:w-1/2 min-h-[350px] sm:min-h-[350px] md:min-h-[500px]"
          data-aos="fade-left"
          data-aos-delay="200">
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
      <section
        className="bg-[#FAF7F2] border-t border-gray-300 py-12 text-center px-4 md:px-6 mt-10 lg:mt-0"
        data-aos="fade-up">
        <h2
          className={`${bitter.className} text-2xl md:text-4xl font-bold mb-4`}
          data-aos="fade-down"
          data-aos-delay="100">
          Kenapa Memilih Gubuk Kopi?
        </h2>

        <p
          className="text-gray-700 max-w-2xl mx-auto mb-10"
          data-aos="fade-up"
          data-aos-delay="200">
          Karena kami menyajikan kopi terbaik dari berbagai daerah di Indonesia,
          diseduh dengan teknik tradisional dan modern untuk pengalaman rasa
          yang autentik.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          data-aos="fade-up"
          data-aos-delay="300">
          {/* Card 1 */}
          <div
            className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center 
      transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            data-aos="zoom-in"
            data-aos-delay="400">
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
      transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            data-aos="zoom-in"
            data-aos-delay="500">
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
      transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            data-aos="zoom-in"
            data-aos-delay="600">
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
      transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            data-aos="zoom-in"
            data-aos-delay="700">
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
      <section
        className="py-10 px-4 md:px-16 lg:px-32 bg-white flex flex-col lg:flex-row-reverse items-center gap-8 md:gap-10 lg:min-h-screen"
        data-aos="fade-up">
        {/* Teks */}
        <div
          className="w-full lg:w-1/2 text-left"
          data-aos="fade-right"
          data-aos-delay="200">
          <h2
            className={`${bitter.className} text-[#E2A22A] text-2xl md:text-3xl lg:text-4xl font-bold mb-4`}>
            Tentang GubukKopi
          </h2>

          <p
            className="text-gray-700 mb-4 text-base md:text-lg leading-relaxed"
            data-aos="fade-right"
            data-aos-delay="300">
            Gubuk Kopi hadir dari semangat melestarikan kekayaan rasa Nusantara.
            Kami memilih biji kopi terbaik dari berbagai daerah, meraciknya
            dengan teknik seduh yang menjaga aroma, rasa, dan kehangatan setiap
            cangkir. Di sini, lebih dari 30 varian menu dari tubruk klasik,
            racikan rempah, hingga kreasi ice blend—siap menemani pagi santai,
            obrolan sahabat, hingga malam yang penuh cerita. Setiap tegukan
            membawa Anda menjelajahi kekayaan rasa Indonesia dalam suasana gubuk
            yang hangat dan bersahaja.
          </p>

          <button
            className="bg-[#E2A22A] text-white px-6 py-3 rounded-lg hover:bg-[#d28f12] transition-colors duration-200 flex items-center gap-2"
            data-aos="zoom-in"
            data-aos-delay="400">
            Pelajari Lebih Lanjut
            <FaArrowRight className="inline" />
          </button>
        </div>

        {/* Gambar */}
        <div
          className="relative w-full lg:w-1/2 min-h-[350px] sm:min-h-[350px] md:min-h-[500px] mt-6 lg:mt-0"
          data-aos="fade-left"
          data-aos-delay="250">
          <Image
            src="/about.jpg"
            alt="Hero Image"
            fill
            priority
            className="object-cover rounded-lg shadow-lg"
          />

          {/* Kotak 30+ Variant */}
          <div
            className="absolute -top-10 right-2 bg-white text-black border border-[#E2A22A]/30 px-4 py-2 rounded-lg w-40 flex flex-col items-center justify-center shadow-md"
            data-aos="zoom-in"
            data-aos-delay="600">
            <div className="flex items-center gap-1">
              <p className="text-md text-[#E2A22A] font-bold text-3xl">30+</p>
            </div>
            <p className="font-medium mt-1 text-[#E2A22A] text-base">
              Variant Menu
            </p>
          </div>
        </div>
      </section>

      <section
        className="py-10 px-4 md:px-16 lg:px-32 bg-white flex flex-col items-center"
        data-aos="fade-up">
        <h2
          className={`${bitter.className} text-[#E2A22A] text-2xl md:text-4xl font-bold mb-2`}
          data-aos="fade-down"
          data-aos-delay="100">
          Menu Best Seller
        </h2>

        <h3
          className="text-gray-700 mb-8 text-base md:text-lg max-w-2xl text-center"
          data-aos="fade-up"
          data-aos-delay="200">
          Pilihan favorit pelanggan setia kami
        </h3>

        {/* see all button */}
        <div
          className="w-full flex justify-end"
          data-aos="fade-left"
          data-aos-delay="300">
          <Link
            href={"/menu"}
            className="text-[#E2A22A] font-semibold mb-6 flex items-center gap-1 hover:underline">
            See all menu
          </Link>
        </div>

        {/* list card */}
        <div data-aos="zoom-in" data-aos-delay="400" className="w-full">
          <ListMenuHome />
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="bg-white border-t border-gray-300 py-12 px-4 md:px-6 mt-10 lg:mt-0"
        id="contact">
        <h2
          data-aos="fade-up"
          className={`${bitter.className} text-[#E2A22A] text-2xl md:text-4xl font-bold mb-4 text-center`}>
          Hubungi Kami
        </h2>

        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-gray-700 max-w-2xl mx-auto mb-10 text-center">
          Tinggalkan pesan atau datang langsung ke gubug kami, kami senang
          mendengar cerita Anda.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="300">
          {/* Info Kontak */}
          <div className="flex flex-col gap-4">
            {/* Lokasi */}
            <div
              data-aos="fade-right"
              className="flex items-center gap-4 bg-white shadow-lg rounded-lg px-5 py-4">
              <div className="bg-[#D9D9D9]/40 rounded-lg w-[80px] h-[80px] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-9 h-9 text-black">
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
                Dukuh, Sidomukti, Kota Salatiga
              </p>
            </div>

            {/* Telepon */}
            <div
              data-aos="fade-right"
              data-aos-delay="200"
              className="flex items-center gap-4 bg-white shadow-lg rounded-lg px-5 py-4">
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
          <div
            data-aos="fade-left"
            data-aos-delay="400"
            className="bg-transparent border border-gray-400 rounded-lg p-6">
            <FormContact />
          </div>
        </div>
      </section>
    </div>
  );
}
