import { CreateUserForm } from "./form-create-user";
import { AlertHandler } from "@/lib/alert-handler"

export default function ProductFormWithAPI() {
  return (
    <main className="min-h-dvh">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">
            Create Product
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new product to add to the store.
          </p>
        </header>

        {/* Client Component untuk menangani alert */}
        <div className="fixed top-4 right-4 z-50 w-96">
          <AlertHandler />
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card">
          <CreateUserForm />
        </div>
      </section>
    </main>
  );
}
