import Image from "next/image";

export default function BlogDetail() {
  return (
    <section className="px-5 max-w-6xl py-28 md:py-32 mx-auto">
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
        <Image
          src="/menu.jpg"
          alt="Judul Blog"
          fill
          className="object-cover"
        />
      </div>

      {/* Title & Meta */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
          Judul Blog
        </h1>
        <p className="text-sm text-gray-500">Tanggal: Jan 15, 2025</p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-md">
        <article className="prose prose-lg max-w-none">
          <p>
            Ini adalah isi dari blog. Di sini kamu bisa menulis artikel lengkap
            dengan paragraf, gambar, kutipan, dan lainnya.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <Image
            src="/menu.jpg"
            alt="Gambar Blog"
            width={800}
            height={500}
            className="my-6 rounded-lg shadow-md"
          />
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
          <blockquote className="border-l-4 border-[#E67E22] pl-4 italic text-gray-700">
            "Kopi bukan hanya minuman, tapi juga cerita dalam setiap
            teguknya."
          </blockquote>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
          </p>
        </article>
      </div>

    </section>
  );
}
