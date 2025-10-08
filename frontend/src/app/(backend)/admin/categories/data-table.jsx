"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { deleteCategory, getProducts } from "@/lib/api";
import { AlertDemo } from "@/components/partial/alert-success";
import DeleteAlert from "@/components/partial/alert-delete";

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export function DataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData);
  const [products, setProducts] = React.useState([]);
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "berhasil menghapus data",
    type: "success",
  });

  // Fetch products data on component mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();
        if (result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Function to count products per category
  const getProductCountByCategory = (categoryId) => {
    return products.filter(product => product.category_id === categoryId).length;
  };

  const handleDeleteCategory = async (id) => {
    try {
      const result = await deleteCategory(id);

      if (result.success) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setAlertState({
          show: true,
          message: "Kategori berhasil dihapus",
          type: "success",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
        console.log("Kategori berhasil dihapus");
      } else {
        console.error("Gagal menghapus kategori:", result.error);
        setAlertState({
          show: true,
          message: `Gagal menghapus kategori: ${result.error}`,
          type: "error",
        });

        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
      }
    } catch (error) {
      console.error("Error saat menghapus kategori:", error);
    }
  };

  const columns = [
    {
      accessorKey: "no",
      header: "No.",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm ml-2">
          {row.index + 1}
        </div>
      ),
      enableHiding: false,
    },
    // {
    //   accessorKey: "image",
    //   header: "Image",
    //   cell: ({ row }) => (
    //     <div className="size-16 overflow-hidden rounded-md border">
    //       <img
    //         src={row.original.image 
    //           ? `http://localhost:8000/storage/${row.original.image}` 
    //           : "/blank-image.png"}
    //         onError={(e) => { e.currentTarget.src = "/blank-image.png" }}
    //         alt={row.original.name}
    //         className="size-full object-cover"
    //       />
    //     </div>
    //   ),
    // },
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => (
        <div
          className="font-medium max-w-[200px] truncate"
          title={row.original.name}
        >
          {row.original.name}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "total_products",
      header: "Total Products",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {getProductCountByCategory(row.original.id)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <Link href={`/admin/categories/edit/${row.original.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <Link href={`/admin/categories/show/${row.original.id}`}>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            
            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <DeleteAlert
                itemName={row.original.name}
                onConfirm={() => handleDeleteCategory(row.original.id)}
                trigger={
                  <button className="w-full text-left text-red-600 focus:text-red-600">
                    Hapus
                  </button>
                }
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }
  ];

  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full flex-col justify-start gap-6 py-5">
      {alertState.show && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <AlertDemo
            message={alertState.message}
            type={alertState.type}
            onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}

      <div className="flex items-end justify-end px-4 lg:px-6 mb-4">
        <div className="flex items-end justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={"/admin/categories/create"}>
            <Button variant="outline" size="sm">
              <IconPlus />
              <span className="hidden lg:inline">Add Category</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} category(s) total.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>←
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>→
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}