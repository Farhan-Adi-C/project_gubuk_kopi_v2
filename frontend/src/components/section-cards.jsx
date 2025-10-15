'use client'
import { IconCurrencyDollar, IconShoppingCart, IconPackage, IconUsers } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/get-token-user";

export function SectionCards() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    totalUsers: 0
  });

  // Format number to Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get token dan fetch data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get token terlebih dahulu
        const authToken = await getAuthToken();

        if (authToken) {
          // Fetch orders dan users secara parallel
          const [ordersResponse, usersResponse] = await Promise.all([
            fetch('http://localhost:8000/api/orders/allhistory', {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }),
            fetch('http://localhost:8000/api/user', {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            })
          ]);
          
          const ordersResult = await ordersResponse.json();
          const usersResult = await usersResponse.json();
          
          if (ordersResult.success) {
            setOrders(ordersResult.data);
          }

          if (usersResult.success) {
            setUsers(usersResult.data);
            // Hitung statistik dengan data orders dan users
            calculateStats(ordersResult.data, usersResult.data);
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

  // Hitung statistik dari data orders dan users
  const calculateStats = (ordersData, usersData) => {
    // Filter hanya orders dengan status paid
    const paidOrders = ordersData.filter(order => order.payment_status === 'paid');
    
    // Total pendapatan dari orders yang paid
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Total jumlah orders yang paid
    const totalOrders = paidOrders.length;
    
    // Total produk terjual dari orders yang paid
    const totalProductsSold = paidOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Total users dari API user
    const totalUsers = usersData ? usersData.length : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalProductsSold,
      totalUsers
    });
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="@container/card">
            <CardHeader>
              <CardDescription>Memuat...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ...
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Pendapatan */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pendapatan</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCurrencyDollar className="size-4" />
              
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total pendapatan kotor 
          </div>
          <div className="text-muted-foreground">
            {stats.totalOrders} transaksi berhasil
          </div>
        </CardFooter>
      </Card>

      {/* Jumlah Pesanan */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Jumlah Pesanan</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalOrders.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShoppingCart className="size-4" />
              Pesanan
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total pesanan diterima <IconShoppingCart className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Pesanan dengan status paid
          </div>
        </CardFooter>
      </Card>

      {/* Produk Terjual */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Produk Terjual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalProductsSold.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage className="size-4" />
              Produk
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unit produk terjual <IconPackage className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total item dari {stats.totalOrders} pesanan
          </div>
        </CardFooter>
      </Card>

      {/* Total User */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total User</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              Pengguna
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Pengguna terdaftar <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total akun yang terdaftar
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}