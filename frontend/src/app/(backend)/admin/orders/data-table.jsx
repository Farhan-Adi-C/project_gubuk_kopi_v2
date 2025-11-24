"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconClock,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconCircleFilled,
  IconTruck,
  IconPackage,
  IconUserCheck,
  IconMapPin,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils"
import DeleteAlert from "@/components/partial/alert-delete"
import { AlertDemo } from "@/components/partial/alert-success"

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

// Normalize order data untuk konsistensi
// Normalize order data untuk konsistensi
function normalizeOrderData(orderData) {
  if (!orderData) return null
  
  // Extract user data dari berbagai kemungkinan struktur
  const userName = orderData.user?.name || orderData.user_name || "Unknown User"
  const userAvatar = orderData.user?.avatar || orderData.user_avatar || "/blank-profile.jpg"
  const userId = orderData.user?.id || orderData.user_id
  
  return {
    ...orderData,
    // Computed fields untuk konsistensi
    user_name: userName,
    user_avatar: userAvatar,
    user_id: userId,
    // Preserve original user object jika ada
    user: orderData.user || {
      id: userId,
      name: userName,
      avatar: userAvatar
    }
  }
}

// Payment Status Badge Component
function PaymentStatusBadge({ status, size = "default" }) {
  const statusConfig = {
    paid: {
      label: 'Lunas',
      icon: <IconCheck className="size-3" />,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      dotClassName: "text-emerald-500"
    },
    pending: {
      label: 'Menunggu',
      icon: <IconClock className="size-3" />,
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      dotClassName: "text-amber-500"
    },
    failed: {
      label: 'Gagal',
      icon: <IconX className="size-3" />,
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
      dotClassName: "text-rose-500"
    },
    expired: {
      label: 'Kadaluarsa',
      icon: <IconAlertCircle className="size-3" />,
      className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
      dotClassName: "text-slate-500"
    }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
      size === "sm" && "px-2.5 py-1.5 text-xs",
      config.className
    )}>
      <IconCircleFilled className={cn("size-2", config.dotClassName)} />
      {config.label}
    </div>
  )
}

// Order Status Badge Component
function OrderStatusBadge({ status, size = "default" }) {
  const statusConfig = {
    pending: {
      label: 'Menunggu',
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      dotClassName: "text-amber-500"
    },
    processed: {
      label: 'Diproses',
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
      dotClassName: "text-blue-500"
    },
    courier_assigned: {
      label: 'Kurir Ditugaskan',
      className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
      dotClassName: "text-indigo-500"
    },
    picked_by_courier: {
      label: 'Diambil Kurir',
      className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
      dotClassName: "text-violet-500"
    },
    on_the_way: {
      label: 'Dalam Perjalanan',
      className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
      dotClassName: "text-orange-500"
    },
    delivered: {
      label: 'Terkirim',
      className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
      dotClassName: "text-green-500"
    },
    completed: {
      label: 'Selesai',
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      dotClassName: "text-emerald-500"
    },
    cancelled: {
      label: 'Dibatalkan',
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
      dotClassName: "text-rose-500"
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
      size === "sm" && "px-2.5 py-1.5 text-xs",
      config.className
    )}>
      <IconCircleFilled className={cn("size-2", config.dotClassName)} />
      {config.label}
    </div>
  )
}

// Payment Status Dropdown Component
function PaymentStatusDropdown({ order, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.payment_status) return
    
    setIsUpdating(true)
    try {
      const authToken = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/orders/${order.order_id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ payment_status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        // API tidak mengembalikan data user, jadi kita preserve data user yang sudah ada
        const updatedData = {
          ...result.data,
          // Preserve semua data user yang existing
          user: order.user,
          user_name: order.user_name,
          user_avatar: order.user_avatar,
          user_id: order.user_id
        }
        
        onStatusUpdate(order.id, newStatus, 'payment_status', updatedData)
      } else {
        throw new Error(result.message || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select 
      value={order.payment_status} 
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={cn(
        "w-full min-w-32 h-9 border-0 bg-transparent shadow-none hover:bg-accent/50",
        isUpdating && "opacity-50 cursor-not-allowed"
      )}>
        <div className="flex items-center gap-2">
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <div className="size-2.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-xs text-muted-foreground">Updating...</span>
            </div>
          ) : (
            <PaymentStatusBadge status={order.payment_status} size="sm" />
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background border dark:border-gray-700 shadow-lg">
        <SelectItem value="pending">
          <PaymentStatusBadge status="pending" size="sm" />
        </SelectItem>
        <SelectItem value="paid">
          <PaymentStatusBadge status="paid" size="sm" />
        </SelectItem>
        <SelectItem value="failed">
          <PaymentStatusBadge status="failed" size="sm" />
        </SelectItem>
        <SelectItem value="expired">
          <PaymentStatusBadge status="expired" size="sm" />
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

// Order Status Dropdown Component
function OrderStatusDropdown({ order, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Status yang tersedia berdasarkan tipe pesanan
  const getAvailableStatuses = (orderType) => {
    if (orderType === "delivery") {
      return [
        "pending",
        "processed", 
        "courier_assigned",
        "picked_by_courier",
        "on_the_way",
        "delivered",
        "completed",
        "cancelled"
      ];
    }
    
    // Untuk dinein dan takeaway
    return [
      "pending",
      "processed",
      "completed", 
      "cancelled"
    ];
  };

  const availableStatuses = getAvailableStatuses(order.order_type);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.order_status) return
    
    setIsUpdating(true)
    try {
      const authToken = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/orders/${order.order_id}/order-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ order_status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        // API tidak mengembalikan data user, jadi kita preserve data user yang sudah ada
        const updatedData = {
          ...result.data,
          // Preserve semua data user yang existing
          user: order.user,
          user_name: order.user_name,
          user_avatar: order.user_avatar,
          user_id: order.user_id
        }
        
        onStatusUpdate(order.id, newStatus, 'order_status', updatedData)
      } else {
        throw new Error(result.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select 
      value={order.order_status} 
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={cn(
        "w-full min-w-36 h-9 border-0 bg-transparent shadow-none hover:bg-accent/50",
        isUpdating && "opacity-50 cursor-not-allowed"
      )}>
        <div className="flex items-center gap-2">
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <div className="size-2.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-xs text-muted-foreground">Updating...</span>
            </div>
          ) : (
            <OrderStatusBadge status={order.order_status} size="sm" />
          )}
        </div>
      </SelectTrigger>
      <SelectContent 
        className="bg-background border dark:border-gray-700 shadow-lg max-h-60"
        position="popper"
        sideOffset={5}
      >
        {availableStatuses.map((status) => (
          <SelectItem 
            key={status} 
            value={status}
            className="cursor-pointer"
          >
            <OrderStatusBadge status={status} size="sm" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Action Menu Component dengan Delete Alert
function ActionMenu({ order, onAction }) {
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)

  const handleDeleteClick = () => {
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = () => {
    onAction(order, 'delete')
    setShowDeleteAlert(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteAlert(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 rounded-lg hover:bg-accent/50"
          >
            <IconDots className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-background border shadow-xl"
        >
          <DropdownMenuItem 
            onClick={() => onAction(order, 'show')}
            className="cursor-pointer flex items-center gap-2 py-2"
          >
            <IconEye className="size-4" />
            <span>Lihat Detail</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onAction(order, 'edit')}
            className="cursor-pointer flex items-center gap-2 py-2"
          >
            <IconEdit className="size-4" />
            <span>Edit Pesanan</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <DeleteAlert
              itemName={`Order ${order.order_id}`}
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              trigger={
                <button className="w-full text-left text-red-600 focus:text-red-600 flex items-center gap-2">
                  <IconTrash className="size-4" />
                  <span>Hapus Pesanan</span>
                </button>
              }
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Alert Modal */}
      {showDeleteAlert && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-semibold">Hapus Pesanan</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus pesanan {order.order_id}? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                className="mt-2 sm:mt-0"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const columns = [
  {
  accessorKey: "user_avatar",
  header: "Pelanggan",
  cell: ({ row }) => {
    const order = row.original
    
    // Handle avatar URL dengan lebih baik
    let avatarUrl = "/blank-profile.jpg"
    if (order.user_avatar && order.user_avatar !== "null" && order.user_avatar !== null) {
      // Jika avatar ada dan bukan null/string "null"
      if (order.user_avatar.startsWith('http')) {
        avatarUrl = order.user_avatar
      } else {
        avatarUrl = `http://localhost:8000/${order.user_avatar}`
      }
    }
    
    // Gunakan computed user_name yang sudah dinormalisasi
    const userName = order.user_name || "Unknown User"
    
    return (
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="size-10 sm:size-12 overflow-hidden rounded-xl border-2 border-background shadow-sm flex-shrink-0 bg-gray-100">
          <img 
            src={avatarUrl}
            alt={userName}
            className="size-full object-cover"
            onError={(e) => {
              e.target.src = "/blank-profile.jpg"
              e.target.classList.add("opacity-50")
            }}
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{userName}</div>
          <div className="text-xs text-muted-foreground font-mono bg-accent/50 px-1.5 py-0.5 rounded truncate">
            {order.order_id}
          </div>
        </div>
      </div>
    )
  },
},
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => (
      <div className="font-bold text-sm sm:text-base min-w-[100px]">
        {formatRupiah(row.original.total_amount)}
      </div>
    ),
  },
  {
    accessorKey: "order_type",
    header: "Tipe",
    cell: ({ row }) => {
      const typeConfig = {
        dinein: { 
          label: 'Dine In', 
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"
        },
        takeaway: { 
          label: 'Take Away', 
          className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400"
        },
        delivery: { 
          label: 'Delivery', 
          className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400"
        }
      }
      
      const config = typeConfig[row.original.order_type] || { 
        label: row.original.order_type, 
        className: "bg-gray-50 text-gray-700 border-gray-200"
      }
      
      return (
        <Badge 
          variant="outline" 
          className={cn("font-medium border shadow-sm text-xs whitespace-nowrap", config.className)}
        >
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "order_status",
    header: "Status Pesanan",
    cell: ({ row, table }) => (
      <div className="min-w-[150px]">
        <OrderStatusDropdown 
          order={row.original} 
          onStatusUpdate={table.options.meta?.onStatusUpdate}
        />
      </div>
    ),
  },
  {
    accessorKey: "payment_status",
    header: "Status Pembayaran",
    cell: ({ row, table }) => (
      <div className="min-w-[140px]">
        <PaymentStatusDropdown 
          order={row.original} 
          onStatusUpdate={table.options.meta?.onStatusUpdate}
        />
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Tanggal Pesanan",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 min-w-[140px]">
        <div className="text-sm font-medium text-foreground whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
          <IconClock className="size-3 flex-shrink-0" />
          {formatTimeAgo(row.original.created_at)}
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <div className="flex justify-end min-w-[50px]">
        <ActionMenu 
          order={row.original}
          onAction={table.options.meta?.onAction}
        />
      </div>
    ),
  },
]

export function DataTable({ data, loading, filterType = 'all', onAction, onDataUpdate }) {
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [alertState, setAlertState] = React.useState({
    show: false,
    message: "",
    type: "success",
  })

  const [localData, setLocalData] = React.useState([])

  // Normalize data ketika data berubah
  React.useEffect(() => {
    if (data && Array.isArray(data)) {
      const normalizedData = data.map(order => normalizeOrderData(order))
      setLocalData(normalizedData)
    }
  }, [data])

  const handleStatusUpdate = (orderId, newStatus, fieldType, updatedData = null) => {
    setLocalData(prevData => 
      prevData.map(order => {
        if (order.id === orderId) {
          // Jika updatedData ada, merge dengan data existing dan normalize
          if (updatedData) {
            return normalizeOrderData({
              ...order, // Data existing (dengan user data lengkap)
              ...updatedData, // Data baru dari API (tanpa user data)
              // Force preserve user data karena API tidak mengembalikannya
              user: order.user,
              user_name: order.user_name,
              user_avatar: order.user_avatar,
              user_id: order.user_id
            })
          }
          // Jika tidak ada updatedData, hanya update status
          return normalizeOrderData({
            ...order,
            [fieldType]: newStatus
          })
        }
        return order
      })
    )
    
    if (onDataUpdate && updatedData) {
      onDataUpdate(updatedData)
    }
  }

  const handleAction = async (order, action) => {
    switch (action) {
      case 'show':
        console.log('Show details:', order.order_id)
        break
      case 'edit':
        console.log('Edit order:', order.order_id)
        break
      case 'delete':
        try {
          const authToken = await getAuthToken()
          const response = await fetch(`http://localhost:8000/api/orders/${order.order_id}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          })

          const result = await response.json()

          if (result.success) {
            // Remove from local state
            setLocalData(prev => prev.filter(item => item.id !== order.id))
            setAlertState({
              show: true,
              message: `Pesanan ${order.order_id} berhasil dihapus`,
              type: "success",
            })
          } else {
            throw new Error(result.message || 'Failed to delete order')
          }
        } catch (error) {
          console.error('Error deleting order:', error)
          setAlertState({
            show: true,
            message: `Gagal menghapus pesanan: ${error.message}`,
            type: "error",
          })
        }
        
        // Auto hide alert after 5 seconds
        setTimeout(() => {
          setAlertState(prev => ({ ...prev, show: false }))
        }, 5000)
        break
    }
    
    onAction?.(order, action)
  }

  const table = useReactTable({
    data: localData,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onStatusUpdate: handleStatusUpdate,
      onAction: handleAction,
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-8 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
          <div className="text-sm font-medium">Memuat data pesanan...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Alert Notification */}
      {alertState.show && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <AlertDemo
            message={alertState.message}
            type={alertState.type}
            onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}

      {/* Column Visibility Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span> pesanan
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg w-full sm:w-auto">
              <IconLayoutColumns className="size-4" />
              <span>Kolom</span>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
      
      {/* Table Container */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id} 
                        className="h-12 font-semibold text-foreground/80 px-3 py-4 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="border-b hover:bg-accent/20 group last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="py-4 px-3 whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground py-8">
                      <IconLayoutColumns className="size-12 opacity-50" />
                      <div className="text-lg font-medium">
                        {filterType === 'all' 
                          ? 'Tidak ada pesanan ditemukan' 
                          : `Tidak ada pesanan ${filterType} ditemukan`
                        }
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
              Baris per halaman:
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}>
              <SelectTrigger className="w-20 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border dark:border-gray-700">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex rounded-lg"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}>
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 rounded-lg"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 rounded-lg"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex rounded-lg"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
              <IconChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}