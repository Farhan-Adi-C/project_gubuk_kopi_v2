export const dynamic = "force-dynamic"; 

import { Metadata } from "next"
import { Suspense } from "react"
import { DataTable } from "./data-table"
import { SkeletonTable } from "@/components/partial/table-skeleton"

export const metadata = {
  title: "Manajemen Meja",
  description: "Kelola meja restoran Anda",
}

// API function untuk server component
const getTables = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/mejas', {
      cache: 'no-store',
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching tables:', error);
    return { success: false, error: error.message };
  }
};

export default async function TablesIndex() {
  const tablesPromise = getTables()

  return (
    <main className="max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">Manajemen Meja</h1>
        <p className="text-muted-foreground text-pretty">Kelola meja restoran Anda</p>
      </header>

      {/* Konten tabel */}
      <section className="rounded-lg border bg-background">
        <Suspense fallback={<SkeletonTable />}>
          <TablesTable tablesPromise={tablesPromise} />
        </Suspense>
      </section>
    </main>
  )
}

async function TablesTable({ tablesPromise }) {
  const tables = await tablesPromise
  
  if (!tables.success) {
    return (
      <div className="p-8 text-center text-destructive">
        Error: {tables.error}
      </div>
    )
  }

  return <DataTable data={tables.data} />
}