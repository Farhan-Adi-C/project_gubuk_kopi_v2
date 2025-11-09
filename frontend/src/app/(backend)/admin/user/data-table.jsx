"use client";

import * as React from "react";
import Link from "next/link";
import { IconDotsVertical, IconLayoutColumns, IconPlus } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import DeleteUserAlert from "@/components/partial/alert-delete-user";
import { deleteUser } from "@/lib/api";
import { AlertDemo } from "@/components/partial/alert-success";

export function UserTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData);
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleDeleteUser = async (id) => {
    try {
      const result = await deleteUser(id);

      if (result.success) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setAlertState({
          show: true,
          message: "User berhasil dihapus",
          type: "success",
        });
      } else {
        setAlertState({
          show: true,
          message: result.error || "Gagal menghapus user",
          type: "error",
        });
      }

      setTimeout(() => setAlertState((prev) => ({ ...prev, show: false })), 3000);
    } catch (error) {
      console.error("Error saat menghapus user:", error);
    }
  };

  const columns = [
    {
      accessorKey: "no",
      header: "No.",
      cell: ({ row }) => <div className="text-muted-foreground text-sm">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) => (
        <div className="size-12 overflow-hidden rounded-full border">
          <img
            src={row.original.avatar ? `http://localhost:8000/storage/${row.original.avatar}` : "/avatar.png"}
            alt={row.original.name}
            className="size-full object-cover"
            onError={(e) => (e.currentTarget.src = "/avatar.png")}
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.email}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString("id-ID")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <Link href={`/admin/users/edit/${row.original.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <Link href={`/admin/users/show/${row.original.id}`}>
              <DropdownMenuItem>View</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DeleteUserAlert
              userName={row.original.name}
              onConfirm={() => handleDeleteUser(row.original.id)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full flex flex-col gap-6 py-5">
      {alertState.show && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <AlertDemo
            message={alertState.message}
            type={alertState.type}
            onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}

      <div className="flex items-end justify-end px-4 mb-4">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table.getAllColumns().map((column) =>
                column.getCanHide() ? (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ) : null
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin/users/create">
            <Button variant="outline" size="sm">
              <IconPlus className="mr-2" /> Add User
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative overflow-auto border rounded-lg">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center px-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} user(s) total.
        </div>
      </div>
    </div>
  );
}
