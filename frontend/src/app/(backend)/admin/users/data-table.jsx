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
import DeleteProductAlert from "@/components/partial/alert-delete-product";
import { deleteUser } from "@/lib/api";
import { AlertDemo } from "@/components/partial/alert-success";

export const schema = z.object({
  id: z.number(),
  avatar: z.string().nullable().optional(),
  name: z.string(),
  email: z.string().email(),
  is_admin: z.boolean(),
  created_at: z.string(), 
});


export function DataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData);
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "berhasil menghapus data",
    type: "success",
  });
  const handleDeleteUser = async (id) => {
    try {
      const result = await deleteUser(id);

      if (result.success) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setAlertState({
          show: true,
          message: "user berhasil dihapus",
          type: "success",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
        console.log("User berhasil dihapus");
      } else {
        console.error("Gagal menghapus user:", result.error);
        setAlertState({
          show: true,
          message: `Gagal menghapus user: ${result.error}`,
          type: "error",
        });

        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
      }
    } catch (error) {
      console.error("Error saat menghapus user:", error);
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
  {
    accessorKey: "avatar",
    header: "Avatar",
    cell: ({ row }) => (
      <div className="size-12 overflow-hidden rounded-full border">
        <img
           src={
            row.original.google_id
                ? row.original.avatar // avatar Google (sudah https URL)
                : row.original.avatar
                ? `http://localhost:8000/storage/${row.original.avatar}`
                : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg" // Ganti dengan path default avatar Anda
            }
            className="size-full object-cover"
            />

      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium max-w-[200px] truncate">
        {row.original.name}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "is_admin",
    header: "Role",
    cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
        {row.original.is_admin === 1 ? "Admin" : "User"}
        </Badge>
    ),
    },

  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("id-ID")}
        </div>
      );
    },
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
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-36">

          <Link href={`/admin/users/edit/${row.original.id}`}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />

          <DeleteProductAlert
            productName={row.original.name}
            onConfirm={() => handleDeleteUser(row.original.id)}
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
          <Link href={"/admin/users/create"}>
            <Button variant="outline" size="sm">
              <IconPlus />
              <span className="hidden lg:inline">Add Product</span>
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
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} product(s) total.
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
