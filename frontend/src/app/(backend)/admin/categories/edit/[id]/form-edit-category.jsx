"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CategoryForm({ categoryId, isEdit = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
  });
  const router = useRouter();

  // Fetch category data for edit mode
  useEffect(() => {
    if (isEdit && categoryId) {
      const fetchCategory = async () => {
        try {
          setIsLoadingData(true);
          const response = await fetch(`http://localhost:8000/api/categories/${categoryId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch category: ${response.status}`);
          }

          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error("Server returned non-JSON response");
          }
          
          const result = await response.json();
          
          // Check if the response has the expected structure
          if (result.data) {
            setFormData({
              name: result.data.name || "",
            });
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          setErrors({ fetch: error.message });
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchCategory();
    }
  }, [isEdit, categoryId]);

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
      const url = isEdit 
        ? `http://localhost:8000/api/categories/${categoryId}`
        : "http://localhost:8000/api/categories";

      const method = "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} category: ${response.status}`;
        
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      let result;
      if (isJson) {
        result = await response.json();
      }

      sessionStorage.setItem(
        "categoryAlert",
        JSON.stringify({
          type: "success",
          message: `Category ${isEdit ? 'updated' : 'created'} successfully!`,
        })
      );

      router.push("/admin/categories");
      router.refresh();

    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} category:`, error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (isEdit && categoryId) {
      // Reset to original data by refetching
      const fetchOriginalData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/categories/${categoryId}`);
          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const result = await response.json();
              if (result.data) {
                setFormData({
                  name: result.data.name || "",
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching original data:", error);
        }
      };
      fetchOriginalData();
    } else {
      setFormData({ name: "" });
    }
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-6 sm:p-8 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-primary"
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
          <span className="text-sm text-muted-foreground">Loading category data...</span>
        </div>
      </div>
    );
  }

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
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter category name"
          className={`w-full rounded-md border ${
            errors.name ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the name of your category
        </p>
      </div>

      {/* Fetch Error */}
      {errors.fetch && (
        <div className="mt-6 p-4 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive">
            Failed to load category data: {errors.fetch}
          </p>
        </div>
      )}

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
          disabled={isLoading}
          className="inline-flex h-10 items-center rounded-md border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            `${isEdit ? "Update" : "Create"} Category`
          )}
        </button>
      </div>
    </form>
  );
}