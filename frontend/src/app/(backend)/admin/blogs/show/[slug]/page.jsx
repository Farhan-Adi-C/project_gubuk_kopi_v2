import { getBlogBySlug } from "@/lib/api";
import BlogShowPage from "./show-page";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const result = await getBlogBySlug(slug);
    
    if (!result || !result.data || result.error) {
      return {
        title: "Blog Not Found",
      };
    }

    const blog = result.data;
    
    return {
      title: `${blog.title} | Blog`,
      description: blog.content?.substring(0, 160) || "Read this interesting blog post",
      openGraph: {
        title: blog.title,
        description: blog.content?.substring(0, 160) || "",
        images: blog.image ? [`http://localhost:8000/storage/${blog.image}`] : [],
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: "Blog",
    };
  }
}

export default async function BlogPage({ params }) {
  const { slug } = params;
  
  try {
    const result = await getBlogBySlug(slug);
    
    if (!result || !result.data || result.error) {
      notFound();
    }

    return <BlogShowPage blog={result.data} />;
  } catch (error) {
    notFound();
  }
}