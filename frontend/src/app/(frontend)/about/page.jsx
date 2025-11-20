import Link from "next/link";
import { FaTools } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
      <FaTools className="text-7xl mb-4 animate-bounce" />

      <h1 className="text-4xl font-bold animate-pulse">
        Coming Soon...
      </h1>

      <p className="mt-3 text-lg opacity-70">
        Halaman ini sedang dalam pengembangan
      </p>

      {/* Button Back */}
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 bg-[#E2A22A] text-white px-6 py-3 rounded-full hover:bg-[#c78b1c] transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaArrowLeft />
        Kembali ke Home
      </Link>
    </div>
  );
}
