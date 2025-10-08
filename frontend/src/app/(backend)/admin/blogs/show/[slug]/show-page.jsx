"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export default function BlogShowPage({ blog: initialBlog }) {
  const router = useRouter();
  const [blog] = useState(initialBlog);
  const [imageError, setImageError] = useState(false);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Estimate reading time
  const getReadingTime = (content) => {
    if (!content) return "1 min";
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Get image URL
  const getImageUrl = () => {
    if (!blog?.image) return null;
    if (blog.image.startsWith('http')) return blog.image;
    return `http://localhost:8000/storage/${blog.image}`;
  };

  const imageUrl = getImageUrl();

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      <main className="w-full">
        {/* Featured Image - Centered with proper aspect ratio */}
        {imageUrl && !imageError && (
          <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl w-full">
              <div className="relative w-full overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt={blog.title}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                  onError={() => setImageError(true)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Blog Content */}
            <article className="space-y-8">
              {/* Title Section */}
              <div className="space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {blog.title}
                </h1>
                
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(blog.created_at || blog.updated_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{getReadingTime(blog.content)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full">
                <div 
                  className="leading-relaxed text-foreground/90 space-y-6 text-base sm:text-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: blog.content?.replace(/\n/g, '<br/>') || '' 
                  }}
                />
              </div>

              {/* Metadata Footer */}
              <div className="flex items-center justify-between pt-8 border-t flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap justify-center">
                  <Calendar className="h-4 w-4" />
                  <span>Published on {formatDate(blog.created_at)}</span>
                  {blog.updated_at !== blog.created_at && (
                    <>
                      <span>•</span>
                      <span>Updated on {formatDate(blog.updated_at)}</span>
                    </>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}