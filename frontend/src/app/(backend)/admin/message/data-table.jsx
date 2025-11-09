"use client";

import * as React from "react";
import { IconDotsVertical, IconLayoutColumns } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AlertDemo } from "@/components/partial/alert-success";
import DeleteAlert from "@/components/partial/alert-delete";
import { deleteMessage } from "@/lib/api";
import { MessageActions } from "@/components/partial/message-action";

export function MessageDataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData || []);
  const [loading, setLoading] = React.useState(false);
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "",
    type: "success",
  });

  //   const handleDeleteMessage = async (id) => {
  //     try {
  //       const result = await deleteMessage(id);

  //       if (result.success) {
  //         setData((prev) => prev.filter((msg) => msg.id !== id));
  //         setAlertState({
  //           show: true,
  //           message: "Pesan berhasil dihapus",
  //           type: "success",
  //         });
  //       } else {
  //         setAlertState({
  //           show: true,
  //           message: result.error || "Gagal menghapus pesan",
  //           type: "error",
  //         });
  //       }

  //       setTimeout(() => {
  //         setAlertState((prev) => ({ ...prev, show: false }));
  //       }, 5000);
  //     } catch (error) {
  //       setAlertState({
  //         show: true,
  //         message: `Error: ${error.message}`,
  //         type: "error",
  //       });
  //       setTimeout(() => {
  //         setAlertState((prev) => ({ ...prev, show: false }));
  //       }, 5000);
  //     }
  //   };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      accessorKey: "name",
      header: "Nama Pengirim",
      cell: ({ row }) => (
        <div className="font-medium max-w-[180px] truncate">
          {row.original.name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[180px] truncate">
          {row.original.email || "-"}
        </div>
      ),
    },
    {
      accessorKey: "message",
      header: "Pesan",
      cell: ({ row }) => (
        <div
          className="text-sm text-muted-foreground max-w-[250px] truncate"
          title={row.original.message}>
          {row.original.message || "-"}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Dikirim Pada",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
          <MessageActions row={row} formatDate={formatDate} />
      ),
    },
  ];

  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <IconLayoutColumns />
              <span className="ml-2">Kustomisasi Kolom</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}>
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {data?.length ? (
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
                    className="h-24 text-center">
                    Tidak ada pesan ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data.length > 0 && (
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              Total {table.getFilteredRowModel().rows.length} pesan.
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Baris per halaman
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}>
                  ←
                </Button>
                <span className="text-sm">
                  Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}>
                  →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
