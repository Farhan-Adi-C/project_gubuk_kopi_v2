import { CategoryForm } from "./form-edit-category";

export default function EditCategoryPage({ params }) {
  const { id } = params;

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="border rounded-lg bg-card">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Edit Category</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update category information
            </p>
          </div>
          <CategoryForm categoryId={id} isEdit={true} />
        </div>
      </div>
    </div>
  );
}