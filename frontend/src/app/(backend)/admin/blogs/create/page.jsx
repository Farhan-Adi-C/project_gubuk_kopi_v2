import { BlogForm } from "./form-create-blog";

export default function FormBlog() {
  return (
    <main className="min-h-dvh">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Create Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new blog post.
          </p>
        </header>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card">
          <BlogForm />
        </div>
      </section>
    </main>
  )
}