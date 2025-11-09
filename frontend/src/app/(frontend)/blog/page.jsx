import Image from "next/image";
import Link from "next/link";

export default async function Blog() {
  // Ambil data dari API backend-mu
  const res = await fetch("http://127.0.0.1:8000/api/blogs", {
    cache: "no-store", // biar selalu ambil data terbaru
  });

  const result = await res.json();
  const posts = result.data || [];

  return (
    <section className="px-5 max-w-6xl py-28 md:py-32 mx-auto">
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
      <h3 className="font-semibold mb-6">Recent Blog Post</h3>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="w-full h-40 relative">
                <Image
                  src={`http://127.0.0.1:8000/storage/${post.image}`}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-xs mb-2">
                  {new Date(post.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h4 className="font-semibold text-base mb-1">{post.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {post.content.slice(0, 100)}...
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-[#E67E22] font-medium hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            Belum ada postingan.
          </p>
        )}
      </div>
    </section>
  );
}
