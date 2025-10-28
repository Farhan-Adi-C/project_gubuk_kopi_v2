"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BlogForm({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [blog, setBlog] = useState(null);
  const router = useRouter();

  // Fetch blog data by slug
  useEffect(() => {
    if (slug) {
      fetchBlogData();
    }
  }, [slug]);

    useEffect(() => {
      const initSummernote = () => {
        if (window.$ && window.$.fn && window.$.fn.summernote) {
          window.$("#summernote").summernote({
            placeholder: "Write your article here...",
            tabsize: 2,
            height: 300,
          });
          if (formData.content) {
          window.$("#summernote").summernote("code", formData.content);
        }
        } else {
          console.warn("Summernote belum siap!");
        }
      };

      if (document.readyState === "complete") {
        initSummernote();
      } else {
        window.addEventListener("load", initSummernote);
      }

      return () => window.removeEventListener("load", initSummernote);
    }, [blog]);


  const fetchBlogData = async () => {
    setIsFetching(true);
    try {
      console.log(`Fetching blog with slug: ${slug}`);
      
      const response = await fetch(
        `http://localhost:8000/api/blogs/${slug}`,
        {
          method: "GET",
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blog data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Blog data received:', result);
      
      // Handle different API response structures
      let blogData;
      
      if (result.data) {
        // Structure: { data: { ... } }
        blogData = result.data;
      } else if (Array.isArray(result) && result.length > 0) {
        // Structure: [ { ... } ]
        blogData = result[0];
      } else {
        // Structure: { ... } (direct object)
        blogData = result;
      }
      
      // Check if blog data is valid
      if (!blogData || !blogData.title) {
        throw new Error("Blog not found or invalid data structure");
      }
      
      setBlog(blogData);
      
      // Set form data
      setFormData({
        title: blogData.title || "",
        content: blogData.content || "",
        currentImage: blogData.image || ""
      });

      // Set preview image if exists - IMPORTANT: Add full URL path like in ProductEditForm
      if (blogData.image) {
        // Jika image sudah berupa URL lengkap
        if (blogData.image.startsWith('http')) {
          setPreviewImage(blogData.image);
        } else {
          // Jika image hanya nama file/path, tambahkan base URL
          setPreviewImage(`http://localhost:8000/storage/${blogData.image}`);
        }
      }

    } catch (error) {
      console.error("Error fetching blog:", error);
      setErrors({ fetch: error.message || "Failed to load blog data" });
    } finally {
      setIsFetching(false);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    currentImage: ""
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ image: "Please select a valid image file" });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrors({ image: "Image size must be less than 20MB" });
      return;
    }

    setSelectedImage(file);
    setErrors(prev => ({ ...prev, image: undefined }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (formData) => {
    const newErrors = {};

    const title = formData.get("title")?.trim();
    if (!title) {
      newErrors.title = "Blog title is required";
    } else if (title.length > 255) {
      newErrors.title = "Blog title must not exceed 255 characters";
    }

    const content = formData.get("content")?.trim();
    if (!content) {
      newErrors.content = "Blog content is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.target);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }else if (blog?.image) {
      formData.append("image", blog.image);
    }

    const content = window.$("#summernote").summernote("code");
    formData.append("content", content);

    console.log('Submitting form data:', Array.from(formData.entries()));

    formData.append("_method", "POST");

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/blogs/${slug}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log('Update response:', result);

      if (!response.ok) {
        throw new Error(result.message || `Failed to update blog: ${response.status}`);
      }

      sessionStorage.setItem(
        "blogAlert",
        JSON.stringify({
          type: "success",
          message: "Blog updated successfully!",
        })
      );

      router.push("/admin/blogs");
      router.refresh();

    } catch (error) {
      console.error("Error updating blog:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset seperti di ProductEditForm
    if (blog) {
      setPreviewImage(blog.image ? `http://localhost:8000/storage/${blog.image}` : null);
      setSelectedImage(null);
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        currentImage: blog.image || ""
      });
    }
    setErrors({});
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="p-6 sm:p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <svg
            className="animate-spin mx-auto h-8 w-8 text-primary"
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
          <p className="mt-2 text-sm text-muted-foreground">Loading blog data...</p>
        </div>
      </div>
    );
  }

  // Error state - blog tidak ditemukan
  if (errors.fetch || !blog) {
    return (
      <div className="p-6 sm:p-8">
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive mb-6">
          <p className="text-sm text-destructive">
            {errors.fetch || "Blog not found"}
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/blogs")}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <form className="p-6 sm:p-8" onSubmit={handleSubmit} onReset={handleReset}>
      {/* Blog Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Blog Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Enter blog title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full rounded-md border ${
            errors.title ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
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
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleImageChange}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {previewImage && !selectedImage
                ? "Current blog image. Click the area above to change image."
                : selectedImage
                ? "New image selected. Click the area above to change image."
                : "Upload blog image. Only one image allowed."}
            </p>
            {(previewImage && selectedImage) && (
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(blog.image ? `http://localhost:8000/storage/${blog.image}` : null);
                  setSelectedImage(null);
                }}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Remove New Image
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
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className={`w-full min-h-64 rounded-md border ${
            errors.content ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content}</p>
        )}
      </div> */}

      <div className=" mt-6 space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea id="summernote" name="content" />
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
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className="inline-flex h-10 items-center rounded-md border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
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
              Updating...
            </>
          ) : (
            "Update Blog"
          )}
        </button>
      </div>
    </form>
  );
}