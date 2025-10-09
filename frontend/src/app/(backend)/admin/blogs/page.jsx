export const dynamic = "force-dynamic"; 

import { Metadata } from "next"
import { Suspense } from "react"
import { BlogDataTable } from "./data-table"
import { SkeletonTable } from "@/components/partial/table-skeleton"
import { getBlogs } from "@/lib/api"
import { AlertHandlerBlog } from "@/lib/alert-handler-blog"

export const metadata = {
  title: "Manajemen Blog",
  description: "Kelola artikel dan konten blog Anda",
}

export default async function BlogsIndex() {
  const blogsPromise = getBlogs()

  return (
    <main className="max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">Manajemen Blog</h1>
        <p className="text-muted-foreground text-pretty">Kelola artikel dan konten blog Anda</p>
      </header>

      {/* Client Component untuk menangani alert */}
      <div className="fixed top-4 right-4 z-50 w-96">
        <AlertHandlerBlog />
      </div>

      {/* Konten tabel */}
      <section className="rounded-lg border bg-background">
        <Suspense fallback={<SkeletonTable />}>
          <BlogsTable blogsPromise={blogsPromise} />
        </Suspense>
      </section>
    </main>
  )
}

async function BlogsTable({ blogsPromise }) {
  const blogs = await blogsPromise
  
 

  return <BlogDataTable data={blogs.data} />
}