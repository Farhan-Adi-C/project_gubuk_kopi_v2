"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token-user";

export function UserEditForm({ id }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errors, setErrors] = useState({});
  const router = useRouter();


  // ============================
  // FETCH USER 
  // ============================
  useEffect(() => {
    console.log("Fetching user data for ID:", id);
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/user/edit/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        const result = await res.json();

        setUser(result.data);

        if (result.data.avatar) {
          setPreviewImage(
            `http://localhost:8000/storage/${result.data.avatar}`
          );
        }
      } catch (err) {
        console.log("FETCH ERROR:", err);
        setErrors({ fetch: err.message });
      } finally {
        setLoadingUser(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // ============================
  // IMAGE PREVIEW
  // ============================
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrors({ image: "Max size 20MB" });
      return;
    }

    setSelectedImage(file);
    setErrors((prev) => ({ ...prev, image: null }));

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
  };

  // ============================
  // FORM VALIDATION
  // ============================
  const validateForm = (formData) => {
    const newErrors = {};

    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();

    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";

    return newErrors;
  };

  // ============================
  // SUBMIT FORM
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const token = await getAuthToken();
    const formData = new FormData(e.target);

    try {
      const res = await fetch(`http://localhost:8000/api/user/update/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

        sessionStorage.setItem(
        "userAlert",
        JSON.stringify({
          type: "success",
          message: "User update successfully!",
        })
      );

      if (!res.ok) throw new Error(data.message || "Update failed");

      router.push("/admin/users");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setPreviewImage(
        user.avatar ? `http://localhost:8000/storage/${user.avatar}` : null
      );

      setSelectedImage(null);
    }

    setErrors({});
  };

  if (loadingUser) {
    return (
      <div className="p-6 text-center">
        <p>Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load user data.
      </div>
    );
  }

  return (
    <form className="p-6 sm:p-8" onSubmit={handleSubmit} onReset={handleReset}>
      {errors.fetch && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive">{errors.fetch}</p>
        </div>
      )}

      {/* NAME */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          User Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter user name"
          defaultValue={user.name}
          className={`w-full rounded-md border ${
            errors.name ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the user's full name
        </p>
      </div>

      {/* EMAIL */}
      <div className="mt-6 space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email"
          defaultValue={user.email}
          className={`w-full rounded-md border ${
            errors.email ? "border-destructive" : "border-input"
          } bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
        <p className="text-xs text-muted-foreground">Enter a valid email</p>
      </div>

      {/* AVATAR */}
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium">Avatar</label>
        <div className="space-y-4">
          <label
            htmlFor="avatar"
            className="block relative rounded-md border-2 border-dashed border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden">
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
                  className="size-12 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5">
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
            id="avatar"
            name="avatar"
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleImageChange}
          />

          {errors.avatar && (
            <p className="text-xs text-destructive">{errors.avatar}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {previewImage && !selectedImage
                ? "Current avatar. Click above to change."
                : selectedImage
                ? "New avatar selected."
                : "Upload user avatar."}
            </p>

            {previewImage && selectedImage && (
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(
                    user.avatar
                      ? `http://localhost:8000/storage/${user.avatar}`
                      : null
                  );
                  setSelectedImage(null);
                }}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors">
                Remove New Image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ERRORS */}
      {errors.submit && (
        <div className="mt-6 p-4 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* BUTTONS */}
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="reset"
          className="inline-flex h-10 items-center rounded-md border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors">
          Reset
        </button>

        <Link
          href="/admin/users"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent transition-colors">
          Back
        </Link>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : (
            "Update User"
          )}
        </button>
      </div>
    </form>
  );
}
