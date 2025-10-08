"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ProductEditForm({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [variants, setVariants] = useState([]);
  const [deletedVariants, setDeletedVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const router = useRouter();

  const safeJsonParse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Invalid JSON response:', text.substring(0, 100));
      throw new Error('Invalid response from server');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch(`http://localhost:8000/api/products/edit/${slug}`);
        
        if (!productResponse.ok) {
          throw new Error(`HTTP error! status: ${productResponse.status}`);
        }

        const productResult = await safeJsonParse(productResponse);

        if (productResult && productResult.data) {
          setProduct(productResult.data);
          
          if (productResult.data.variants) {
            const existingVariants = productResult.data.variants.map(variant => ({
              id: variant.id,
              name: variant.name,
              additional_price: variant.additional_price?.toString() || "0",
              isNew: false
            }));
            setVariants(existingVariants);
          }

          if (productResult.data.image) {
            setPreviewImage(`http://localhost:8000/storage/${productResult.data.image}`);
          }
        } else {
          throw new Error("Failed to load product data");
        }

      } catch (error) {
        console.error("Error fetching product:", error);
        setErrors({ fetch: error.message });
      } finally {
        setProductLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/categories");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await safeJsonParse(response);

        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (slug) {
      fetchData();
      fetchCategories();
    }
  }, [slug]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrors({ image: "File size must be less than 20MB" });
      return;
    }

    setSelectedImage(file);
    setErrors(prev => ({ ...prev, image: null }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    const newVariant = {
      id: `new_${Date.now()}`,
      name: "",
      additional_price: "0",
      isNew: true
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id) => {
    const variantToRemove = variants.find(variant => variant.id === id);
    
    if (variantToRemove && !variantToRemove.isNew) {
      setDeletedVariants([...deletedVariants, id]);
    }
    
    setVariants(variants.filter((variant) => variant.id !== id));
  };

  const updateVariant = (id, field, value) => {
    setVariants(
      variants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const validateForm = (formData) => {
    const newErrors = {};

    const name = formData.get("name")?.trim();
    if (!name) {
      newErrors.name = "Product name is required";
    } else if (name.length > 255) {
      newErrors.name = "Product name must not exceed 255 characters";
    }

    const price = formData.get("price");
    if (!price || parseFloat(price) < 0) {
      newErrors.price = "Price is required and must be at least 0";
    }

    const stock = formData.get("stock");
    if (!stock || parseInt(stock) < 0) {
      newErrors.stock = "Stock is required and must be at least 0";
    }

    if (!formData.get("category")) {
      newErrors.category = "Category is required";
    }

    const discount = formData.get("discount");
    if (discount && (parseFloat(discount) < 0 || parseFloat(discount) > 100)) {
      newErrors.discount = "Discount must be between 0 and 100";
    }

    variants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        newErrors[`variants.${index}.name`] = "Variant name is required";
      }
      const additionalPrice = parseFloat(variant.additional_price);
      if (isNaN(additionalPrice) || additionalPrice < 0) {
        newErrors[`variants.${index}.additional_price`] = "Additional price must be a valid number and at least 0";
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.target);

    const existingVariants = variants.filter(variant => !variant.isNew);
    const newVariants = variants.filter(variant => variant.isNew);

    existingVariants.forEach((variant) => {
      formData.append(`variants[${variant.id}][name]`, variant.name);
      formData.append(`variants[${variant.id}][additional_price]`, variant.additional_price);
    });

    newVariants.forEach((variant, index) => {
      formData.append(`new_variants[${index}][name]`, variant.name);
      formData.append(`new_variants[${index}][additional_price]`, variant.additional_price);
    });

    deletedVariants.forEach((variantId, index) => {
      formData.append(`deleted_variants[${index}]`, variantId);
    });

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    formData.append("_method", "POST");

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/products/update/${slug}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'Server returned HTML instead of JSON. Check API endpoint.';
          } else {
            errorMessage = errorText.substring(0, 100);
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await safeJsonParse(response);

      if (result.status === 'success') {
        sessionStorage.setItem(
          "productAlert",
          JSON.stringify({
            type: "success",
            message: "Product updated successfully!",
          })
        );
        router.push("/admin/products");
      } else {
        throw new Error(result.message || "Failed to update product");
      }

    } catch (error) {
      console.error("Error updating product:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (product) {
      setPreviewImage(product.image ? `http://localhost:8000/storage/${product.image}` : null);
      setSelectedImage(null);
      
      const originalVariants = product.variants ? product.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        additional_price: variant.additional_price?.toString() || "0",
        isNew: false
      })) : [];
      setVariants(originalVariants);
      setDeletedVariants([]);
    }
    setErrors({});
  };

  if (productLoading) {
    return (
      <div className="p-6 sm:p-8 flex justify-center items-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="bg-destructive/10 border border-destructive rounded-md p-4">
          <p className="text-destructive">Failed to load product</p>
          {errors.fetch && <p className="text-sm text-destructive mt-2">{errors.fetch}</p>}
          <button onClick={() => window.location.reload()} className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
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

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Product Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter product name"
          defaultValue={product.name}
          className={`w-full rounded-md border ${errors.name ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        <p className="text-xs text-muted-foreground">Enter the name of your product</p>
      </div>

      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium">Product Image</label>
        <div className="space-y-4">
          <label htmlFor="image" className="block relative rounded-md border-2 border-dashed border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden">
            {previewImage ? (
              <div className="w-full h-64 flex items-center justify-center">
                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center gap-3 p-8">
                <svg className="size-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.2A4 4 0 1 1 19 18H7z" />
                  <path d="M12 12v6" />
                  <path d="M9 15l3-3 3 3" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, JPG (MAX. 20MB)</p>
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

          {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {previewImage && !selectedImage
                ? "Current product image. Click the area above to change image."
                : selectedImage
                ? "New image selected. Click the area above to change image."
                : "Upload product image. Only one image allowed."}
            </p>
            {(previewImage && selectedImage) && (
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(product.image ? `http://localhost:8000/storage/${product.image}` : null);
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

      <div className="mt-6 space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe your product in detail..."
          defaultValue={product.description || ''}
          className="w-full min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Provide a detailed description of your product</p>
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="category" className="text-sm font-medium">Category *</label>
        <div className="relative">
          <select
            id="category"
            name="category"
            className={`w-full appearance-none rounded-md border ${errors.category ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
            defaultValue={product.category_id || ''}
            disabled={categoriesLoading}
          >
            <option value="" disabled>
              {categoriesLoading ? "Loading categories..." : "Select a category"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">▼</div>
        </div>
        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        <p className="text-xs text-muted-foreground">Choose the most relevant category for your product</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">Price ($) *</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product.price}
            className={`w-full rounded-md border ${errors.price ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          <p className="text-xs text-muted-foreground">Product price</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="discount" className="text-sm font-medium">Discount (%)</label>
          <input
            id="discount"
            name="discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            defaultValue={product.discount || 0}
            className={`w-full rounded-md border ${errors.discount ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
          />
          {errors.discount && <p className="text-xs text-destructive">{errors.discount}</p>}
          <p className="text-xs text-muted-foreground">Discount percentage</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="stock" className="text-sm font-medium">Stock *</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={product.stock}
            className={`w-full rounded-md border ${errors.stock ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
          />
          {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
          <p className="text-xs text-muted-foreground">Available quantity</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium">Variants</label>
          <button type="button" onClick={addVariant} className="inline-flex h-9 items-center rounded-md border border-input bg-secondary px-3 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={variant.id} className="p-4 border border-border rounded-md bg-muted/30">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-foreground text-base">
                  Variant #{index + 1} 
                  {variant.isNew && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">New</span>}
                </h4>
                <button type="button" onClick={() => removeVariant(variant.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Variant Name *</label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                    placeholder="e.g., Size, Color, etc."
                    className={`w-full rounded-md border ${errors[`variants.${index}.name`] ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
                  />
                  {errors[`variants.${index}.name`] && <p className="text-xs text-destructive">{errors[`variants.${index}.name`]}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variant.additional_price}
                    onChange={(e) => updateVariant(variant.id, "additional_price", e.target.value)}
                    placeholder="0.00"
                    className={`w-full rounded-md border ${errors[`variants.${index}.additional_price`] ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring`}
                  />
                  {errors[`variants.${index}.additional_price`] && <p className="text-xs text-destructive">{errors[`variants.${index}.additional_price`]}</p>}
                </div>
              </div>
            </div>
          ))}

          {variants.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-md bg-muted/20">
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="text-sm text-muted-foreground">No variants added yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Add Variant" to create product variations</p>
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="mt-6 p-4 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

    <div className="mt-8 flex items-center justify-end gap-3">
  <button
    type="reset"
    className="inline-flex h-10 items-center rounded-md border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
  >
    Reset
  </button>

  <Link
    href="/admin/products"
    className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent transition-colors"
  >
    Back
  </Link>

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
      "Update Product"
    )}
  </button>
</div>
    </form>
  );
}