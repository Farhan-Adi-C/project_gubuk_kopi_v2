export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { CreateTableForm } from "./create.form";

export const metadata = {
  title: "Tambah Meja Baru",
  description: "Tambah meja baru ke sistem",
};

export default function CreateTablePage() {
  return (
    <main className="max-w-4xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">
          Tambah Meja Baru
        </h1>
        <p className="text-muted-foreground text-pretty">
          Tambahkan meja baru ke dalam sistem restoran
        </p>
      </header>

      <section className="rounded-lg border bg-background p-6">
        <CreateTableForm />
      </section>
    </main>
  );
}