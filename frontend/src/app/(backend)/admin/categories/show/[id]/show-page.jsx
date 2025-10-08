"use client";

import * as React from "react";
import { 
  IconArrowLeft, 
  IconEye, 
  IconTag,
  IconPackage,
  IconStack2,
  IconCalendar,
  IconEdit,
  IconBox,
  IconPlus
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CategoryShowClient({ category, products }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/categories">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <IconArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Category details and associated products
              </p>
            </div>
          </div>
          <Link href={`/admin/categories/edit/${category.id}`}>
            <Button>
              <IconEdit className="h-4 w-4 mr-2" />
              Edit Category
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Category Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconTag className="h-5 w-5 text-muted-foreground" />
                  Category Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center p-6">
                  <div className="size-20 bg-primary/10 rounded-xl flex items-center justify-center">
                    <IconBox className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Category Name</span>
                    <span className="font-semibold">{category.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Total Products</span>
                    <Badge variant="secondary">
                      {products.length}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Created</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(category.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Updated</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(category.updated_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconPackage className="h-5 w-5 text-muted-foreground" />
                  Associated Products
                  <Badge variant="secondary" className="ml-2">
                    {products.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const [imageError, setImageError] = React.useState(false);

  // Format price to Rupiah
  const formatRupiah = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const finalPrice = product.discount > 0 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
      {/* Product Image */}
      <div className="relative size-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {product.image && !imageError ? (
          <img
            src={`http://localhost:8000/storage/${product.image}`}
            onError={() => setImageError(true)}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-muted flex items-center justify-center">
            <IconPackage className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {product.discount > 0 && (
          <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 border-0">
            -{product.discount}%
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {product.description || "No description"}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <IconStack2 className="h-3 w-3" />
                <span>Stock: {product.stock}</span>
              </div>
              {product.variants && product.variants.length > 0 && (
                <div className="flex items-center gap-1">
                  <IconTag className="h-3 w-3" />
                  <span>{product.variants.length} variants</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="text-right">
                {product.discount > 0 ? (
                  <>
                    <span className="font-semibold text-green-600">
                      {formatRupiah(finalPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through block">
                      {formatRupiah(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-green-600">
                    {formatRupiah(product.price)}
                  </span>
                )}
              </div>
            </div>
            
            <Link href={`/admin/products/show/${product.id}`}>
              <Button variant="ghost" size="sm" className="h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconEye className="h-3 w-3 mr-1" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="size-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
        <IconPackage className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-2">No Products Found</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
        There are no products associated with this category yet.
      </p>
      <Link href="/admin/products/create">
        <Button>
          <IconPlus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </Link>
    </div>
  );
}