
import MenuFilter from "@/components/MenuFilter";
import { Bitter } from "next/font/google";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // sesuaikan kebutuhan
  variable: "--font-bitter", // optional, kalau mau pakai CSS variable
});

export default function Menu() {

  return (
    <div className="min-h-screen bg-gray-50 py-10 flex flex-col pt-28 md:pt-32 lg:pt-36">
      {/* Judul */}
      <div className="text-center mb-8">
        <h1 className={`${bitter.className} text-3xl md:text-4xl font-bold text-[#E67E22]`}>
          Semua Menu Kami
        </h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Dari kopi tubruk klasik hingga kreasi ice blend, nikmati semua pilihan
          kami di satu tempat.
        </p>
      </div>

        <MenuFilter/>
    </div>
  );
}
