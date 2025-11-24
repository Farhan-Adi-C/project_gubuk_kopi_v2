export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditTableForm } from "./edit-form";

export const metadata = {
  title: "Edit Meja",
  description: "Edit data meja",
};

// API function untuk server component
const getTable = async (id) => {
  try {
    const response = await fetch(`http://localhost:8000/api/mejas/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch table');
    }
    
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default async function EditTablePage({ params }) {
  const table = await getTable(params.id);

  if (!table.success || !table.data) {
    notFound();
  }

  return (
    <main className="max-w-4xl px-6 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">
          Edit Meja
        </h1>
        <p className="text-muted-foreground text-pretty">
          Edit data meja {table.data.table_number}
        </p>
      </header>

      <section className="rounded-lg border bg-background p-6">
        <EditTableForm tableData={table.data} />
      </section>
    </main>
  );
}