"use client";

import DeleteAlert from "@/components/partial/alert-delete";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ShowPage({ slug: initialSlug }) {
  const params = useParams();
  const router = useRouter();
  const slug = initialSlug || params.slug;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/products/${slug}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const result = await response.json();

        if (result.data) {
          setProduct(result.data);
        } else {
          throw new Error(result.message || "Failed to load product");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const getFinalPrice = () => {
    if (!product) return 0;

    let basePrice = calculateDiscountedPrice(product.price, product.discount);

    if (selectedVariant) {
      basePrice += selectedVariant.additional_price;
    }

    return basePrice;
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteProduct(product.slug);

      if (result.success) {
        // Set alert message sebelum redirect
        sessionStorage.setItem(
          "productAlert",
          JSON.stringify({
            type: "success",
            message: "Product deleted successfully!",
          })
        );
        
        // Redirect ke halaman products
        router.push("/admin/products");
      } else {
        console.error("Failed to delete product:", result.error);
        setError(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Product Not Found
          </h2>
          <p className="text-muted-foreground">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <a
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  const baseDiscountedPrice = calculateDiscountedPrice(
    product.price,
    product.discount
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
         
          <Link
            href="/admin/products"
            className="hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg bg-muted overflow-hidden border">
              <img
                src={ product.image ?
                `http://localhost:8000/storage/${product.image}` : 
                  "/blank-image.png"
                  }
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
              {product.category.name}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(getFinalPrice())}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-muted-foreground line-through">
                      {formatPrice(
                        product.price + (selectedVariant?.additional_price || 0)
                      )}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {selectedVariant && selectedVariant.additional_price > 0 && (
                <p className="text-sm text-muted-foreground">
                  Base price: {formatPrice(baseDiscountedPrice)} +{" "}
                  {formatPrice(selectedVariant.additional_price)} variant
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  product.stock > 0 ? "bg-green-500" : "bg-destructive"
                }`}
              />
              <span
                className={`text-sm ${
                  product.stock > 0 ? "text-green-600" : "text-destructive"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            {/* Variants Selection */}
            {product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Select Variant
                </h3>
                <div className="grid gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant?.id === variant.id ? null : variant
                        )
                      }
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/5"
                          : "border-input bg-background hover:bg-accent"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {variant.name}
                        </span>
                        {variant.additional_price > 0 && (
                          <span className="text-muted-foreground">
                            +{formatPrice(variant.additional_price)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href={`/admin/products/edit/${product.slug}`}
                className="flex flex-1 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-md font-medium transition-colors"
              >
                Edit Product
              </Link>

              <DeleteAlert
  itemName={product.name}
  onConfirm={() => handleDeleteProduct(product.id)}
  trigger={
    <Button
      variant="destructive"
      className="h-12 px-6 text-primary-foreground"
    >
      Delete Produk
    </Button>
  }
/>


            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <p className="font-medium text-foreground">{product.slug}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium text-foreground">
                    {product.category.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-16 border-t pt-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Product Details
            </h2>

            {/* Product Details Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left p-4 font-medium text-foreground">
                      Attribute
                    </th>
                    <th className="text-left p-4 font-medium text-foreground">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-background">
                    <td className="p-4 text-muted-foreground">Product Name</td>
                    <td className="p-4 text-foreground font-medium">
                      {product.name}
                    </td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 text-muted-foreground">Description</td>
                    <td className="p-4 text-foreground">
                      {product.description}
                    </td>
                  </tr>
                  <tr className="border-b bg-background">
                    <td className="p-4 text-muted-foreground">Base Price</td>
                    <td className="p-4 text-foreground font-medium">
                      {formatPrice(product.price)}
                    </td>
                  </tr>
                  {product.discount > 0 && (
                    <tr className="border-b bg-muted/30">
                      <td className="p-4 text-muted-foreground">Discount</td>
                      <td className="p-4 text-green-600 font-medium">
                        {product.discount}%
                      </td>
                    </tr>
                  )}
                  <tr className="border-b bg-background">
                    <td className="p-4 text-muted-foreground">Final Price</td>
                    <td className="p-4 text-foreground font-medium">
                      {formatPrice(baseDiscountedPrice)}
                    </td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 text-muted-foreground">
                      Stock Available
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      {product.stock} units
                    </td>
                  </tr>
                  <tr className="border-b bg-background">
                    <td className="p-4 text-muted-foreground">Category</td>
                    <td className="p-4 text-foreground font-medium">
                      {product.category.name}
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4 text-muted-foreground">
                      Total Variants
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      {product.variants.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}