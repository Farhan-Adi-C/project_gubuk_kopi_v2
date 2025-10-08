import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="w-full flex-col justify-start gap-6">
      {/* Skeleton untuk header actions */}
      <div className="flex items-end justify-end px-4 lg:px-6 mb-4">
        <div className="flex items-end justify-end gap-2">
          <Skeleton className="h-9 w-32" /> {/* Customize Columns button */}
          <Skeleton className="h-9 w-32" /> {/* Add Product button */}
        </div>
      </div>

      {/* Skeleton untuk table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            {/* Table Header Skeleton */}
            <div className="bg-muted sticky top-0 z-10 border-b">
              <div className="grid grid-cols-10 gap-4 px-4 py-3">
                {/* Drag handle column */}
                <Skeleton className="h-4 w-6" />
                {/* No. column */}
                <Skeleton className="h-4 w-8" />
                {/* Image column */}
                <Skeleton className="h-4 w-12" />
                {/* Product Name column */}
                <Skeleton className="h-4 w-24" />
                {/* Category column */}
                <Skeleton className="h-4 w-16" />
                {/* Price column */}
                <Skeleton className="h-4 w-12" />
                {/* Discount column */}
                <Skeleton className="h-4 w-16" />
                {/* Stock column */}
                <Skeleton className="h-4 w-12" />
                {/* Actions column */}
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Table Body Skeleton */}
            <div className="divide-y">
              {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="grid grid-cols-10 gap-4 px-4 py-3 items-center">
                  {/* Drag handle */}
                  <Skeleton className="h-8 w-6 rounded" />
                  
                  {/* No. */}
                  <Skeleton className="h-4 w-6 rounded" />
                  
                  {/* Image */}
                  <Skeleton className="size-12 rounded-md" />
                  
                  {/* Product Name */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  
                  {/* Category */}
                  <Skeleton className="h-5 w-16 rounded-full" />
                  
                  {/* Price */}
                  <Skeleton className="h-4 w-20 rounded" />
                  
                  {/* Discount */}
                  <Skeleton className="h-5 w-12 rounded-full" />
                  
                  {/* Stock */}
                  <Skeleton className="h-5 w-14 rounded-full" />
                  
                  {/* Actions */}
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton untuk pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 lg:flex">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            {/* Rows per page selector */}
            <div className="hidden items-center gap-2 lg:flex">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
            
            {/* Page info */}
            <Skeleton className="h-4 w-24" />
            
            {/* Pagination buttons */}
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}