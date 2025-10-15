"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
} from "@tabler/icons-react"
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
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAuthToken } from "@/lib/get-token-user"
import { useEffect, useState } from "react"

export const schema = z.object({
  id: z.number(),
  order_id: z.string(),
  user_name: z.string(),
  total_amount: z.number(),
  created_at: z.string(),
  payment_status: z.string(),
})

// Format waktu relatif
function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} detik yang lalu`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} menit yang lalu`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} jam yang lalu`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} hari yang lalu`
  }
}

// Format Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Create a separate component for the drag handle
function DragHandle({
  id
}) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent">
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "user_avatar",
    header: "Profile",
    cell: ({ row }) => {
      const avatarUrl = row.original.user_avatar 
        ? `http://localhost:8000/${row.original.user_avatar}`
        : "/blank-profile.jpg"
      
      return (
        <div className="flex items-center gap-3">
          <div className="size-8 overflow-hidden rounded-full border">
            <img 
              src={avatarUrl}
              alt={row.original.user_name}
              className="size-full object-cover"
              onError={(e) => {
                e.target.src = "/blank-profile.jpg"
              }}
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "user_name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="font-medium">{row.original.user_name}</div>
        <div className="text-xs text-muted-foreground">{row.original.order_id}</div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => (
      <div className="font-semibold">{formatRupiah(row.original.total_amount)}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Order Date",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="text-sm">{new Date(row.original.created_at).toLocaleDateString('id-ID')}</div>
        <div className="text-xs text-muted-foreground">{formatTimeAgo(row.original.created_at)}</div>
      </div>
    ),
  },
  {
    accessorKey: "payment_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.payment_status
      const getStatusConfig = (status) => {
        switch (status) {
          case 'paid':
            return { variant: 'default', icon: <IconCircleCheckFilled className="fill-green-500 size-3" />, label: 'Paid' }
          case 'pending':
            return { variant: 'secondary', icon: <IconCircleCheckFilled className="fill-yellow-500 size-3" />, label: 'Pending' }
          case 'failed':
            return { variant: 'destructive', icon: <IconCircleCheckFilled className="fill-red-500 size-3" />, label: 'Failed' }
          default:
            return { variant: 'outline', icon: null, label: status }
        }
      }
      
      const config = getStatusConfig(status)
      
      return (
        <Badge variant={config.variant} className="gap-1 px-2 py-1">
          {config.icon}
          {config.label}
        </Badge>
      )
    },
  },
]

function DraggableRow({
  row
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Fetch data orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const authToken = await getAuthToken()
        
        if (authToken) {
          const response = await fetch('http://localhost:8000/api/orders/allhistory', {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          })
          
          const result = await response.json()
          
          if (result.success) {
            // Filter hanya orders dengan status paid dan process data untuk table
            const processedData = result.data
              .filter(order => order.payment_status === 'paid') // Hanya yang paid
              .map(order => ({
                id: order.id,
                order_id: order.order_id,
                user_name: order.user?.name || 'Unknown User',
                user_avatar: order.user?.avatar || null, // Menggunakan field avatar
                total_amount: order.total_amount,
                created_at: order.created_at,
                payment_status: order.payment_status,
              }))
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort terbaru dulu
              .slice(0, 10) // Ambil 10 terbaru
            
            setData(processedData)
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data])

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
  })

  function handleDragEnd(event) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex);
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat data orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-end justify-end px-4 lg:px-6">
        <div className="flex items-end justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) =>
                typeof column.accessorFn !== "undefined" &&
                column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
         
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}>
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No paid orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} paid order(s) total.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
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
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}