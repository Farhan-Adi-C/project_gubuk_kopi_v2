import { Metadata } from "next"
import { Suspense } from "react"
import { DataTable } from "./data-table"
import { getCategories } from "@/lib/api"
import { SkeletonTable } from "@/components/partial/table-skeleton"
import { AlertHandlerCategory } from "@/lib/alert-handler-category"

export const metadata = {
  title: "Kategori Produk",
  description: "Kelola kategori produk Anda",
}

export default async function CategoriesIndex() {
  const categoriesPromise = getCategories()

  return (
    <main className="max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">Kategori Produk</h1>
        <p className="text-muted-foreground text-pretty">Kelola kategori produk Anda</p>
      </header>

      {/* Client Component untuk menangani alert */}
      <div className="fixed top-4 right-4 z-50 w-96">
        <AlertHandlerCategory />
      </div>

      {/* Konten tabel */}
      <section className="rounded-lg border bg-background">
        <Suspense fallback={<SkeletonTable />}>
          <CategoriesTable categoriesPromise={categoriesPromise} />
        </Suspense>
      </section>
    </main>
  )
}

async function CategoriesTable({ categoriesPromise }) {
  const categories = await categoriesPromise
  
  if (!categories.success) {
    return (
      <div className="p-8 text-center text-destructive">
        Error: {categories.error}
      </div>
    )
  }

  return <DataTable data={categories.data} />
}