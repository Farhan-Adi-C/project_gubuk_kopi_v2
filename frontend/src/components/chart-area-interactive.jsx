"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/get-token-user"

export const description = "An interactive area chart showing orders data"

const chartConfig = {
  orders: {
    label: "Pesanan",
    color: "var(--primary)",
  }
}

export function ChartAreaInteractive() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  // Get token dan fetch data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get token terlebih dahulu
        const authToken = await getAuthToken();

        if (authToken) {
          const response = await fetch('http://localhost:8000/api/orders/allhistory', {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          })
          
          const result = await response.json()
          
          if (result.success) {
            processChartData(result.data)
          }
        }
      } catch (error) {
        console.error('Error fetching orders data:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // Process data untuk chart
  const processChartData = (ordersData) => {
    // Group orders by date (created_at)
    const ordersByDate = ordersData.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0] // YYYY-MM-DD
      
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += 1
      
      return acc
    }, {})

    // Convert to array format untuk chart
    const processedData = Object.entries(ordersByDate)
      .map(([date, count]) => ({
        date,
        orders: count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date

    setChartData(processedData)
  }

  // Update chart config untuk orders
  const updatedChartConfig = {
    orders: {
      label: "Pesanan",
      color: "var(--primary)",
    }
  }

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Statistik Pesanan</CardTitle>
          <CardDescription>
            Memuat data pesanan...
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Statistik Pesanan</CardTitle>
        <CardDescription>
          Total pesanan berdasarkan tanggal pembuatan
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={updatedChartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      year: 'numeric',
                      month: "long",
                      day: "numeric",
                    });
                  }}
                  indicator="dot" />
              } />
            <Area
              dataKey="orders"
              type="natural"
              fill="url(#fillOrders)"
              stroke="var(--color-orders)"
              strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}