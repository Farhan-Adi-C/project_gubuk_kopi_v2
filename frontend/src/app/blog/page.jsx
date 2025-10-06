import Image from "next/image";
import Link from "next/link";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "Manfaat kopi hitam pahit sebelum olahraga",
      date: "Jan 8, 2025",
      excerpt:
        "Kopi tubruk sederhana ala desa, hitam pekat bisa tanpa gula dan dengan gula.",
      image: "/menu.jpg",
    },
    {
      id: 2,
      title: "Rahasia Latte Art untuk Pemula",
      date: "Jan 12, 2025",
      excerpt:
        "Tips mudah bikin latte art di rumah hanya dengan alat sederhana.",
      image: "/menu.jpg",
    },
    {
      id: 3,
      title: "Asal Usul Kopi Nusantara",
      date: "Jan 20, 2025",
      excerpt:
        "Kenali berbagai daerah penghasil kopi terbaik di Indonesia.",
      image: "/menu.jpg",
    },
    {
      id: 4,
      title: "Kopi dan Produktivitas Kerja",
      date: "Jan 22, 2025",
      excerpt:
        "Bagaimana secangkir kopi bisa meningkatkan fokus dan energi sepanjang hari.",
      image: "/menu.jpg",
    },
  ];

  return (
    <section className="px-5 max-w-6xl py-28 md:py-32 mx-auto ">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold mb-2 md:text-2xl lg:text-3xl">
          Cerita di Balik Setiap Cangkir
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed max-w-2xl md:text-base mx-auto">
          Dari biji pilihan sampai ke meja kamu—kisah kopi, teknik seduh,
          dan tips menikmati rasa terbaik.
        </p>
      </div>

      {/* Recent Post */}
      <h3 className="font-semibold mb-6">Recent blog Post</h3>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
          >
            <div className="w-full h-40 relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-gray-400 text-xs mb-2">{post.date}</p>
              <h4 className="font-semibold text-base mb-1">{post.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
              <Link
                href={`/blog/${post.id}`}
                className="text-sm text-[#E67E22] font-medium hover:underline"
              >
                Read more →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
