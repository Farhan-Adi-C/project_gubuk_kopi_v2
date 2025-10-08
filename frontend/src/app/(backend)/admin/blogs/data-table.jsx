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

import { Badge } from "@/components/ui/badge";
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
import { deleteBlog, getBlogs } from "@/lib/api";
import { AlertDemo } from "@/components/partial/alert-success";
import DeleteAlert from "@/components/partial/alert-delete";

export const schema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export function BlogDataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData || []);
  const [loading, setLoading] = React.useState(false);
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "",
    type: "success",
  });


  

  const handleDeleteBlog = async (slug) => {
    try {
      console.log("Menghapus blog dengan slug:", slug);
      const result = await deleteBlog(slug);

      if (result.success) {
        // Remove deleted item from local state
        setData((prevData) => prevData.filter((item) => item.slug !== slug));
        setAlertState({
          show: true,
          message: "Blog berhasil dihapus",
          type: "success",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
      } else {
        console.error("Gagal menghapus blog:", result.error);
        setAlertState({
          show: true,
          message: `Gagal menghapus blog: ${result.error}`,
          type: "error",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
      }
    } catch (error) {
      console.error("Error saat menghapus blog:", error);
      setAlertState({
        show: true,
        message: `Error: ${error.message}`,
        type: "error",
      });
      setTimeout(() => {
        setAlertState((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return '-';
    }
  };

  const truncateContent = (content, maxLength = 50) => {
    if (!content) return '-';
    // Remove HTML tags for cleaner preview
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/blank-image.png";
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    // Check if it's a relative path from storage
    if (imagePath.startsWith('storage/')) {
      return `http://localhost:8000/${imagePath}`;
    }
    // Default to storage path
    return `http://localhost:8000/storage/${imagePath}`;
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
    {
      accessorKey: "image",
      header: "Gambar",
      cell: ({ row }) => (
        <div className="size-16 overflow-hidden rounded-md border">
          <img
            src={getImageUrl(row.original.image)}
            onError={(e) => { 
              e.currentTarget.src = "/blank-image.png";
              e.currentTarget.alt = "Gambar tidak tersedia";
            }}
            alt={row.original.title || "Blog image"}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Judul Blog",
      cell: ({ row }) => (
        <div
          className="font-medium max-w-[200px] truncate"
          title={row.original.title}
        >
          {row.original.title || '-'}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm max-w-[150px] truncate">
          {row.original.slug || '-'}
        </div>
      ),
    },
    {
      accessorKey: "content",
      header: "Konten",
      cell: ({ row }) => (
        <div 
          className="max-w-[200px] truncate text-sm"
          title={row.original.content}
        >
          {truncateContent(row.original.content)}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Dibuat Pada",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Diupdate Pada",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.updated_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
              disabled={loading}
            >
              <IconDotsVertical />
              <span className="sr-only">Buka menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <Link href={`/admin/blogs/edit/${row.original.slug}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <Link href={`/admin/blogs/show/${row.original.slug}`}>
              <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DeleteAlert
              itemName={row.original.title || 'blog ini'}
              onConfirm={() => handleDeleteBlog(row.original.slug)}
              trigger={
                <button className="w-full text-left text-red-600 hover:text-red-700 focus:text-red-700 px-2 py-1.5 text-sm">
                  Hapus
                </button>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
    getRowId: (row) => row.id?.toString() || row.slug || Math.random().toString(),
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
              <Button variant="outline" size="sm" disabled={loading}>
                <IconLayoutColumns />
                <span className="hidden lg:inline">Kustomisasi Kolom</span>
                <span className="lg:hidden">Kolom</span>
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
                      {column.id === "created_at" ? "Tanggal Dibuat" :
                       column.id === "updated_at" ? "Tanggal Diupdate" :
                       column.id === "content" ? "Konten" :
                       column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={"/admin/blogs/create"}>
            <Button variant="outline" size="sm" disabled={loading}>
              <IconPlus />
              <span className="hidden lg:inline">Tambah Blog</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {loading && (
        <div className="px-4 lg:px-6 mb-4">
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Memuat data blog...</span>
          </div>
        </div>
      )}

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
              {!loading && table.getRowModel().rows?.length ? (
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
                    {loading ? "Memuat data blog..." : "Tidak ada blog ditemukan."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {!loading && data.length > 0 && (
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              Total {table.getFilteredRowModel().rows.length} blog.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Baris per halaman
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
                Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
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
                  <span className="sr-only">Ke halaman sebelumnya</span>←
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ke halaman berikutnya</span>→
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}