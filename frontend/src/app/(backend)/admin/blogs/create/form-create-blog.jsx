"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BlogForm() {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (formData) => {
    const newErrors = {};

    // Validasi title
    if (!formData.get("title")?.trim()) {
      newErrors.title = "Blog title is required";
    } else if (formData.get("title").length > 255) {
      newErrors.title = "Blog title must not exceed 255 characters";
    }

    // Validasi content
    if (!formData.get("content")?.trim()) {
      newErrors.content = "Blog content is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.target);

    // Tambahkan image file jika ada
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    // Validasi form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/blogs",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create blog");
      }

      sessionStorage.setItem(
        "blogAlert",
        JSON.stringify({
          type: "success",
          message: "Blog created successfully!",
        })
      );

      router.push("/admin/blogs");

      e.target.reset();
      setPreviewImage(null);
      setSelectedImage(null);
      setErrors({});
    } catch (error) {
      console.error("Error creating blog:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPreviewImage(null);
    setSelectedImage(null);
    setErrors({});
  };

  useEffect(() => {
    const initSummernote = () => {
      if (window.$ && window.$.fn && window.$.fn.summernote) {
        window.$("#summernote").summernote({
          placeholder: "Write your article here...",
          tabsize: 2,
          height: 300,
        });
      } else {
        console.warn("Summernote belum siap!");
      }
    };

    // tunggu sampai semua script CDN selesai dimuat
    if (document.readyState === "complete") {
      initSummernote();
    } else {
      window.addEventListener("load", initSummernote);
    }

    // cleanup listener biar gak nambah terus
    return () => window.removeEventListener("load", initSummernote);
  }, []);


  return (
    <form className="p-6 sm:p-8" onSubmit={handleSubmit} onReset={handleReset}>
      {/* Blog Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Blog Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Enter blog title"
          className={`w-full rounded-md border ${
            errors.title ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the title of your blog
        </p>
      </div>

      {/* Blog Image */}
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium">Blog Image</label>

        <div className="space-y-4">
          <label
            htmlFor="image"
            className="block relative rounded-md border-2 border-dashed border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
          >
            {previewImage ? (
              <div className="w-full h-64 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center gap-3 p-8">
                <svg
                  aria-hidden="true"
                  className="size-12 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.2A4 4 0 1 1 19 18H7z" />
                  <path d="M12 12v6" />
                  <path d="M9 15l3-3 3 3" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, JPG (MAX. 20MB)
                  </p>
                </div>
              </div>
            )}
          </label>

          <input
            id="image"
            name="image"
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleImageChange}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {previewImage
                ? "Image selected. Click the area above to change image."
                : "Upload blog image. Only one image allowed."}
            </p>
            {previewImage && (
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedImage(null);
                }}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {/* <div className="mt-6 space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          placeholder="Write your blog content here..."
          className={`w-full min-h-64 rounded-md border ${
            errors.content ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Provide the content of your blog
        </p>
      </div> */}

      <div className=" mt-6 space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea id="summernote" name="content"/>
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content}</p>
        )}
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
            "Create Blog"
          )}
        </button>
      </div>
    </form>
  );
}