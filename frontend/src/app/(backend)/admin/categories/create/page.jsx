import { CategoryForm } from "./form-create-category";


export default function ProductFormWithAPI() {
  return (
    <main className="min-h-dvh">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Create Category</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new Category .
          </p>
        </header>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card">
          <CategoryForm />
        </div>
      </section>
    </main>
  )
}

