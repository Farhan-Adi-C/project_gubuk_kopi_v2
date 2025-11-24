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
import { AlertDemo } from "@/components/partial/alert-success";
import DeleteAlert from "@/components/partial/alert-delete";

export const schema = z.object({
  id: z.number(),
  table_number: z.string(),
  capacity: z.number(),
  status: z.enum(['available', 'reserved']),
  created_at: z.string(),
  updated_at: z.string(),
});

// API functions
const getTables = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/mejas', {
      cache: 'no-store',
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching tables:', error);
    return { success: false, error: error.message };
  }
};

const deleteTable = async (id) => {
  try {
    const response = await fetch(`http://localhost:8000/api/mejas/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting table:', error);
    return { success: false, error: error.message };
  }
};

const updateTableStatus = async (id, status) => {
  try {
    const response = await fetch(`http://localhost:8000/api/mejas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating table status:', error);
    return { success: false, error: error.message };
  }
};

export function DataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData);
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleDeleteTable = async (id) => {
    try {
      const result = await deleteTable(id);

      if (result.success) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setAlertState({
          show: true,
          message: "Meja berhasil dihapus",
          type: "success",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
        console.log("Meja berhasil dihapus");
      } else {
        console.error("Gagal menghapus meja:", result.error);
        setAlertState({
          show: true,
          message: `Gagal menghapus meja: ${result.error}`,
          type: "error",
        });

        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
      }
    } catch (error) {
      console.error("Error saat menghapus meja:", error);
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const result = await updateTableStatus(id, newStatus);

      if (result.success) {
        // Update data lokal dengan data terbaru dari server
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? result.data : item
          )
        );
        setAlertState({
          show: true,
          message: "Status meja berhasil diupdate",
          type: "success",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 3000);
      } else {
        console.error("Gagal mengupdate status meja:", result.error);
        setAlertState({
          show: true,
          message: `Gagal mengupdate status: ${result.error}`,
          type: "error",
        });
        setTimeout(() => {
          setAlertState((prev) => ({ ...prev, show: false }));
        }, 5000);
      }
    } catch (error) {
      console.error("Error saat mengupdate status meja:", error);
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
      accessorKey: "table_number",
      header: "Nomor Meja",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.table_number}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "capacity",
      header: "Kapasitas",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.original.capacity} Orang
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          available: "bg-green-100 text-green-800 border border-green-200",
          reserved: "bg-yellow-100 text-yellow-800 border border-yellow-200"
        };
        
        const statusLabels = {
          available: "Tersedia",
          reserved: "Dipesan"
        };

        return (
          <Select
            value={status}
            onValueChange={(newStatus) => 
              handleStatusChange(row.original.id, newStatus)
            }
          >
            <SelectTrigger className={`w-32 ${statusColors[status]}`}>
              <SelectValue>
                <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                  {statusLabels[status]}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">
                <span className="text-green-800">Tersedia</span>
              </SelectItem>
              <SelectItem value="reserved">
                <span className="text-yellow-800">Dipesan</span>
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
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
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <Link href={`/admin/mejas/edit/${row.original.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
           
            <DropdownMenuSeparator />
            
            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <DeleteAlert
                itemName={`Meja ${row.original.table_number}`}
                onConfirm={() => handleDeleteTable(row.original.id)}
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
                      {column.id === 'table_number' ? 'Nomor Meja' : 
                       column.id === 'capacity' ? 'Kapasitas' : 
                       column.id === 'status' ? 'Status' : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={"/admin/mejas/create"}>
            <Button variant="outline" size="sm">
              <IconPlus />
              <span className="hidden lg:inline">Tambah Meja</span>
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
                    Tidak ada data meja.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} meja total.
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
      </div>
    </div>
  );
}