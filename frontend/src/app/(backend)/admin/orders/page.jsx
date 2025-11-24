"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/lib/get-token-user"

// Process order data from API
function processOrderData(orderData) {
  return {
    id: orderData.id,
    order_id: orderData.order_id,
    user_name: orderData.user?.name || 'Unknown User',
    user_avatar: orderData.user?.avatar || null,
    total_amount: orderData.total_amount,
    order_type: orderData.order_type,
    order_status: orderData.order_status || 'pending',
    payment_status: orderData.payment_status,
    payment_method: orderData.payment_method,
    created_at: orderData.created_at,
    meja: orderData.meja,
    shipping_address: orderData.shipping_address,
    pickup_time: orderData.pickup_time,
    items: orderData.items,
    status_timestamps: orderData.status_timestamps,
  }
}

export default function OrdersPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch data orders dengan optimasi
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
            next: { revalidate: 30 }
          })
          
          const result = await response.json()
          
          if (result.success) {
            const processedData = result.data.map(processOrderData)
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

  // Filter data berdasarkan tab aktif
  const filteredData = data.filter(order => {
    if (activeTab === "all") return true
    return order.order_type === activeTab
  })

  // Statistik orders
  const stats = {
    total: data.length,
    dinein: data.filter(order => order.order_type === 'dinein').length,
    takeaway: data.filter(order => order.order_type === 'takeaway').length,
    delivery: data.filter(order => order.order_type === 'delivery').length,
  }

  // Handle update data dari child component
  const handleDataUpdate = (updatedOrderData) => {
    setData(prevData => 
      prevData.map(order => 
        order.id === updatedOrderData.id ? processOrderData(updatedOrderData) : order
      )
    )
  }

  // Handle actions dari data table
  const handleAction = async (order, action) => {
    switch (action) {
      case 'show':
        console.log('Show details:', order.order_id)
        break
      case 'edit':
        console.log('Edit order:', order.order_id)
        break
      // Case delete sudah ditangani di data-table
    }
  }

  // Refresh data manual
  const handleRefresh = async () => {
    setLoading(true)
    try {
      const authToken = await getAuthToken()
      const response = await fetch('http://localhost:8000/api/orders/allhistory', {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store'
      })
      
      const result = await response.json()
      
      if (result.success) {
        const processedData = result.data.map(processOrderData)
        setData(processedData)
      }
    } catch (error) {
      console.error('Error refreshing orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 px-10">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mt-2">
                Kelola semua pesanan dari pelanggan
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All order types</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Dine In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.dinein}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">In-restaurant orders</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Takeaway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats.takeaway}</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Pickup orders</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.delivery}</div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Home delivery orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs untuk filter order type */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4 bg-muted p-1">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-slate-300 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    All Orders
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dinein" 
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-100"
                  >
                    Dine In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="takeaway" 
                    className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-900 dark:data-[state=active]:text-emerald-100"
                  >
                    Take Away
                  </TabsTrigger>
                  <TabsTrigger 
                    value="delivery" 
                    className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-amber-900 dark:data-[state=active]:text-amber-100"
                  >
                    Delivery
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="m-0">
                <div className="p-6 pt-4">
                  <DataTable 
                    data={filteredData} 
                    loading={loading}
                    filterType={activeTab}
                    onAction={handleAction}
                    onDataUpdate={handleDataUpdate}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}