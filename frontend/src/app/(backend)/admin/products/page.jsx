import { Metadata } from "next"
import { Suspense } from "react"
import { DataTable } from "./data-table"
import { getProducts } from "../../../../lib/api.js"
import { SkeletonTable } from "@/components/partial/table-skeleton"
import { AlertHandler } from "@/lib/alert-handler"

export const metadata = {
  title: "Katalog Produk",
  description: "Kelola inventori dan daftar produk Anda",
}

export default async function ProductsIndex() {
  const productsPromise = getProducts()

  return (
    <main className="max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">Katalog Produk</h1>
        <p className="text-muted-foreground text-pretty">Kelola inventori dan daftar produk Anda</p>
      </header>

      {/* Client Component untuk menangani alert */}
      <div className="fixed top-4 right-4 z-50 w-96">
      <AlertHandler />

      </div>

      {/* Konten tabel */}
      <section className="rounded-lg border bg-background">
        <Suspense fallback={<SkeletonTable />}>
          <ProductsTable productsPromise={productsPromise} />
        </Suspense>
      </section>
    </main>
  )
}

async function ProductsTable({ productsPromise }) {
  const products = await productsPromise
  return <DataTable data={products.data} />
}