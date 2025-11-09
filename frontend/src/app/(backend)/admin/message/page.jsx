export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Metadata } from "next";
import { MessageDataTable } from "./data-table";
import { SkeletonTable } from "@/components/partial/table-skeleton";
import { getMessage } from "@/lib/api";
import { AlertHandlerBlog } from "@/lib/alert-handler-blog";

export const metadata = {
  title: "Manajemen Pesan",
  description: "Monitoring pesan dari user",
};

export default async function BlogsIndex() {
  const messagesPromise = getMessage();

  return (
    <main className="max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">
          Manajemen Pesan
        </h1>
        <p className="text-muted-foreground text-pretty">
          Monitoring pesan dari user
        </p>
      </header>

      {/* Client Component untuk menangani alert */}
      <div className="fixed top-4 right-4 z-50 w-96">
        <AlertHandlerBlog />
      </div>

      {/* Konten tabel */}
      <section className="rounded-lg border bg-background">
        <Suspense fallback={<SkeletonTable />}>
          <MessageTable messagesPromise={messagesPromise} />
        </Suspense>
      </section>
    </main>
  );
}

async function MessageTable({ messagesPromise }) {
  const messages = await messagesPromise;

  return <MessageDataTable data={messages.data.data} />;
}
