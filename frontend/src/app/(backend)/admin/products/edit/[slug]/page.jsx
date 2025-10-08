// Dalam halaman edit product Anda

import { ProductEditForm } from "./form-edit-product";

export default async function EditProductPage({ params }) {
  const slug = await params.slug;
  
  return (
      <main className="min-h-dvh">
          <section className="max-w-5xl mx-auto px-6 py-10">
            <header className="mb-8">
              <h1 className="text-balance text-2xl font-semibold tracking-tight">Edit Product</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Edit product details
              </p>
            </header>
    
            {/* Form */}
            <div className="rounded-lg border border-border bg-card">
               <ProductEditForm slug={slug} />
            </div>
          </section>
        </main>
  );
}