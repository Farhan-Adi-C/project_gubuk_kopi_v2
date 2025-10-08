"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CategoryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();


  const validateForm = (formData) => {
    const newErrors = {};

    // Validasi name
    if (!formData.get("name")?.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.get("name").length > 255) {
      newErrors.name = "Category name must not exceed 255 characters";
    }


    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.target);


    // Validasi form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/categories",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      sessionStorage.setItem(
        "categoryAlert",
        JSON.stringify({
          type: "success",
          message: "Category created successfully!",
        })
      );

      router.push("/admin/categories");

      e.target.reset();
    
      setErrors({});
    } catch (error) {
      console.error("Error creating category:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
   
    setErrors({});
  };

  return (
    <form className="p-6 sm:p-8" onSubmit={handleSubmit} onReset={handleReset}>
      {/* Category Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Category Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter category name"
          className={`w-full rounded-md border ${
            errors.name ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the name of your category
        </p>
      </div>


      {/* Error Submit */}
      {errors.submit && (
        <div className="mt-6 p-4 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="reset"
          className="inline-flex h-10 items-center rounded-md border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            "Create Category"
          )}
        </button>
      </div>
    </form>
  );
}