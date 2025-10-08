import { ProductForm } from "./form-create-product";


export default function ProductFormWithAPI() {
  return (
    <main className="min-h-dvh">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Create Product</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new product to add to the store.
          </p>
        </header>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card">
          <ProductForm />
        </div>
      </section>
    </main>
  )
}

