"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/get-token-user"

export const description = "A bar chart showing product sales"

export function BarChartType() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalIncrease, setTotalIncrease] = useState(0)

  // Get token dan fetch data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get token terlebih dahulu
        const authToken = await getAuthToken();

        if (authToken) {
          // Fetch products dan orders secara parallel
          const [productsResponse, ordersResponse] = await Promise.all([
            fetch('http://localhost:8000/api/products', {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }),
            fetch('http://localhost:8000/api/orders/allhistory', {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            })
          ]);
          
          const productsResult = await productsResponse.json();
          const ordersResult = await ordersResponse.json();
          
          if (productsResult.data && ordersResult.success) {
            processChartData(productsResult.data, ordersResult.data)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Process data untuk chart
  const processChartData = (productsData, ordersData) => {
    // Filter hanya orders dengan status paid
    const paidOrders = ordersData.filter(order => order.payment_status === 'paid');
    
    // Hitung total quantity per product dari semua paid orders
    const productSales = {};
    
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product_id;
        if (!productSales[productId]) {
          productSales[productId] = 0;
        }
        productSales[productId] += item.quantity;
      });
    });

    // Map product data dengan sales quantity
    const processedData = productsData.map((product) => {
      const salesQuantity = productSales[product.id] || 0;
      
      return {
        product: product.name,
        sales: salesQuantity,
        productId: product.id
      };
    }).sort((a, b) => b.sales - a.sales); // Sort by sales descending

    setChartData(processedData);

    // Hitung persentase peningkatan
    const totalSales = processedData.reduce((sum, item) => sum + item.sales, 0);
    const previousTotal = Math.max(1, totalSales - 10);
    const increase = ((totalSales - previousTotal) / previousTotal) * 100;
    setTotalIncrease(increase);
  }

  const chartConfig = {
    sales: {
      label: "Penjualan",
    }
  };

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Statistik Penjualan Produk</CardTitle>
          <CardDescription>Memuat data produk dan penjualan...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Statistik Penjualan Produk</CardTitle>
        <CardDescription>Berdasarkan jumlah unit terjual</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
              right: 20,
              top: 10,
              bottom: 10,
            }}
          >
            <defs>
              {/* Gradient untuk bar chart - tema mono */}
              <linearGradient id="monoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#404040" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#737373" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a3a3a3" stopOpacity={0.7} />
              </linearGradient>
              {/* Gradient untuk hover effect */}
              <linearGradient id="monoGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#262626" stopOpacity={1} />
                <stop offset="50%" stopColor="#525252" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#737373" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <YAxis
              dataKey="product"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
              tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              fontSize={12}
              stroke="#666666"
            />
            <XAxis 
              dataKey="sales" 
              type="number" 
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              fontSize={12}
              stroke="#666666"
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(115, 115, 115, 0.1)' }}
              content={
                <ChartTooltipContent 
                  hideLabel 
                  className="bg-white border border-gray-300 shadow-lg text-gray-900"
                  formatter={(value) => [
                    <div key="sales" className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-600" />
                      <span className="font-semibold">{value} unit</span>
                    </div>,
                    "sales"
                  ]}
                />
              }
            />
            <Bar 
              dataKey="sales" 
              layout="vertical" 
              radius={[0, 4, 4, 0]}
              fill="url(#monoGradient)"
              stroke="url(#monoGradient)"
              strokeWidth={0}
              className="transition-all duration-200 hover:fill-url(#monoGradientHover)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground flex gap-2">
          <span>{chartData.length} produk</span>
        </div>
      </CardFooter>
    </Card>
  )
}