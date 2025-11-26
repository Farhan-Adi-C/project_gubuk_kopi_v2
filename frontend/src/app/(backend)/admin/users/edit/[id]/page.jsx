import {UserEditForm} from "./form-edit-user";
export default function EditUserPage({ params }) {
  const { id } = params;

  return (
    <main className="min-h-dvh">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Edit User</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit user details
          </p>
        </header>

        <div className="rounded-lg border border-border bg-card">
          <UserEditForm id={id} />
        </div>
      </section>
    </main>
  );
}
