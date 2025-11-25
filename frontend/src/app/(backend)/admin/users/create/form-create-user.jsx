"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthToken } from "@/lib/get-token-user";

export function CreateUserForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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

    if (!formData.get("name")?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.get("email")?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.get("email"))) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.get("password")?.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.get("password").length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const token = await getAuthToken(); 

    const formData = new FormData(e.target);

    if (selectedImage) {
      formData.append("avatar", selectedImage);
    }

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/user/create", {
        method: "POST",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,   
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create user");
      }

      sessionStorage.setItem(
        "userAlert",
        JSON.stringify({
          type: "success",
          message: "User created successfully!",
        })
      );

      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPreviewImage(null);
    setSelectedImage(null);
    setErrors({});
  };

  return (
    <form className="p-6 sm:p-8" onSubmit={handleSubmit} onReset={handleReset}>
      {/* NAME */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name *</label>
        <input
          name="name"
          type="text"
          className={`w-full rounded-md border ${
            errors.name ? "border-destructive" : "border-input"
          } bg-background px-3 py-2`}
          placeholder="Enter full name"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* EMAIL */}
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium">Email *</label>
        <input
          name="email"
          type="email"
          className={`w-full rounded-md border ${
            errors.email ? "border-destructive" : "border-input"
          } bg-background px-3 py-2`}
          placeholder="Enter email"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium">Password *</label>
        <input
          name="password"
          type="password"
          className={`w-full rounded-md border ${
            errors.password ? "border-destructive" : "border-input"
          } bg-background px-3 py-2`}
          placeholder="Enter password"
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      {/* AVATAR */}
       <div className="mt-6 space-y-2">
        <label className="text-sm font-medium">User avatar</label>

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
                : "Upload product image. Only one image allowed."}
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

      {/* Submit Error */}
      {errors.submit && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-destructive text-sm">{errors.submit}</p>
        </div>
      )}

      {/* BUTTON ACTION */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="reset"
          className="px-4 py-2 border rounded-md bg-secondary hover:bg-accent"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
