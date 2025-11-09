"use client"; 
import Image from "next/image";
import React, { useState, useEffect,use } from "react";

export default function BlogDetail({ params }) {
  const { slug } = use(params);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/blogs/${slug}`, {
          cache: "no-store",
        });
        const result = await res.json();
        setBlog(result.data);
      } catch (error) {
        console.error("Failed to load blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <section className="px-5 max-w-6xl py-28 md:py-32 mx-auto text-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </section>
    );
  }

  if (!blog) {
    return (
      <section className="px-5 max-w-6xl py-28 md:py-32 mx-auto text-center">
        <div className="bg-[#E2A22A]/10 p-8 rounded-2xl shadow-md border border-[#E2A22A]/30">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#E2A22A]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#E2A22A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Artikel Tidak Ditemukan
          </h2>
          <p className="text-gray-600">
            Maaf, artikel yang Anda cari tidak dapat ditemukan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 max-w-6xl py-20 md:py-24 mx-auto relative">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="relative w-full h-64 md:h-96 lg:h-[500px] mb-8 rounded-2xl overflow-hidden shadow-md group">
          <Image
            src={`http://127.0.0.1:8000/storage/${blog.image}`}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Overlay Content */}
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="inline-flex items-center gap-2 bg-[#E2A22A]/80 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {new Date(blog.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>

            <div className="w-24 h-1 bg-[#E2A22A] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-[#E2A22A]/30 rounded-2xl shadow-md overflow-hidden">
          <div className="h-2 w-full bg-[#E2A22A]"></div>

          <article className="p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify
                prose-a:text-[#E2A22A] hover:prose-a:text-[#E2A22A]/80
                prose-img:rounded-xl prose-img:shadow-md
                prose-blockquote:border-l-4 prose-blockquote:border-[#E2A22A] prose-blockquote:bg-[#E2A22A]/10 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
              "
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-[#E2A22A]/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#E2A22A] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xl">
                      {blog.author?.[0]?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {blog.author || "Admin"}
                    </p>
                    <p className="text-sm text-gray-500">Penulis Artikel</p>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="inline-flex items-center gap-2 bg-[#E2A22A]/10 text-[#E2A22A] px-4 py-2 rounded-full text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {new Date(blog.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-[#E2A22A]/10 rounded-2xl p-8 border border-[#E2A22A]/30 shadow-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#E2A22A] rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Menikmati artikel ini?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Jelajahi lebih banyak artikel menarik lainnya di blog kami dan
              temukan wawasan baru.
            </p>
            <button
              className="bg-[#E2A22A] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-md"
            >
              Jelajahi Artikel Lainnya
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingButton />
    </section>
  );
}

// ---------------------- FAB COMPONENT ----------------------
function FloatingButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="bg-[#E2A22A] text-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  );
}
