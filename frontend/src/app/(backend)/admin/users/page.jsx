export const dynamic = "force-dynamic"; 

import { Metadata } from "next"
import { Suspense } from "react"
import { DataTable } from "./data-table"
import {  getUser } from "../../../../lib/api.js"
import { SkeletonTable } from "@/components/partial/table-skeleton"
import { AlertHandlerUser } from "@/lib/alert-handler-user"
// import { User } from "lucide-react";

export const metadata = {
  title: "Katalog Produk",
  description: "Kelola inventori dan daftar produk Anda",
}

export default async function UsersIndex() {
  const usersPromise = getUser()

  return (
    <main className="max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-pretty">Kelola daftar user Anda</p>
      </header>

      {/* Client Component untuk menangani alert */}
      <div className="fixed top-4 right-4 z-50 w-96">
      <AlertHandlerUser />

      </div>

      {/* Konten tabel */}
      <section className="rounded-lg border bg-background">
        <Suspense fallback={<SkeletonTable />}>
          <UsersTable usersPromise={usersPromise} />
        </Suspense>
      </section>
    </main>
  )
}

async function UsersTable({ usersPromise }) {
  const user = await usersPromise
  return <DataTable data={user.data.data} />
}