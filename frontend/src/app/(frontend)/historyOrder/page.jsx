"use client";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token-user";
import { 
  FiShoppingBag, 
  FiArrowRight, 
  FiClock, 
  FiCheckCircle, 
  FiTruck, 
  FiXCircle,
  FiCreditCard,
  FiHome,
  FiPackage,
  FiCoffee,
  FiUser,
  FiLoader,
  FiMapPin,
  FiUserCheck,
  FiDollarSign,
  FiSmartphone
} from "react-icons/fi";
import Link from "next/link";

export default function HistoryOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Tab configuration dengan status delivery yang spesifik
  const tabs = [
    { 
      id: "all", 
      label: "Semua Pesanan", 
      icon: FiShoppingBag,
      color: "text-gray-600"
    },
    { 
      id: "pending_payment", 
      label: "Menunggu Bayar", 
      icon: FiCreditCard,
      color: "text-yellow-600"
    },
    { 
      id: "pending", 
      label: "Menunggu Antrean", 
      icon: FiLoader,
      color: "text-blue-600"
    },
    { 
      id: "processed", 
      label: "Sedang Diproses", 
      icon: FiPackage,
      color: "text-purple-600"
    },
    { 
      id: "delivery", 
      label: "Dalam Pengiriman", 
      icon: FiTruck,
      color: "text-indigo-600"
    },
    { 
      id: "completed", 
      label: "Selesai", 
      icon: FiCheckCircle,
      color: "text-green-600"
    },
    { 
      id: "cancelled", 
      label: "Dibatalkan", 
      icon: FiXCircle,
      color: "text-red-600"
    },
  ];

  // Function untuk menentukan status display dengan handling delivery
  const getOrderDisplayStatus = (order) => {
    // Prioritas 1: Cek payment_status terlebih dahulu
    if (order.payment_status === 'pending') {
      return 'pending_payment';
    }
    
    if (order.payment_status === 'failed' || order.payment_status === 'expired') {
      return 'cancelled';
    }
    
    // Jika payment paid/settled, lihat order_status
    if (order.payment_status === 'paid') {
      // Handling khusus untuk delivery
      if (order.order_type === 'delivery') {
        switch (order.order_status) {
          case 'pending':
            return 'pending'; // Menunggu konfirmasi restoran
          case 'processed':
            return 'processed'; // Sedang diproses/dimasak
          case 'courier_assigned':
          case 'picked_by_courier':
          case 'on_the_way':
            return 'delivery'; // Dalam proses pengiriman
          case 'delivered':
            return 'completed'; // Selesai/Terkirim
          case 'cancelled':
            return 'cancelled';
          default:
            return 'pending';
        }
      } else {
        // Untuk dinein dan takeaway
        switch (order.order_status) {
          case 'pending':
            return 'pending';
          case 'processed':
            return 'processed';
          case 'completed':
            return 'completed';
          case 'cancelled':
            return 'cancelled';
          default:
            return 'pending';
        }
      }
    }
    
    return 'pending';
  };

  // PaymentMethodBadge component baru
  const PaymentMethodBadge = ({ method }) => {
    const methodMap = {
      cash: { 
        color: "bg-green-50 text-green-700 border border-green-200", 
        text: "Cash",
        icon: FiDollarSign
      },
      midtrans: { 
        color: "bg-blue-50 text-blue-700 border border-blue-200", 
        text: "Online Payment",
        icon: FiSmartphone
      },
      // Tambahkan method lain jika diperlukan
    };
    
    const config = methodMap[method] || { 
      color: "bg-gray-50 text-gray-700 border border-gray-200", 
      text: method,
      icon: FiCreditCard
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  // StatusBadge component dengan mapping yang lengkap termasuk delivery
  const StatusBadge = ({ order }) => {
    const displayStatus = getOrderDisplayStatus(order);
    
    const statusMap = {
      pending_payment: { 
        color: "bg-yellow-100 text-yellow-700 border border-yellow-200", 
        text: "Menunggu Pembayaran",
        icon: FiCreditCard
      },
      pending: { 
        color: "bg-blue-100 text-blue-700 border border-blue-200", 
        text: "Menunggu Antrean",
        icon: FiLoader
      },
      processed: { 
        color: "bg-purple-100 text-purple-700 border border-purple-200", 
        text: order.order_type === 'delivery' ? "Sedang Dimasak" : "Sedang Diproses",
        icon: FiPackage
      },
      delivery: {
        color: "bg-indigo-100 text-indigo-700 border border-indigo-200",
        text: getDeliveryStatusText(order.order_status),
        icon: getDeliveryStatusIcon(order.order_status)
      },
      completed: { 
        color: "bg-green-100 text-green-700 border border-green-200", 
        text: order.order_type === 'delivery' ? "Terkirim" : "Selesai",
        icon: FiCheckCircle
      },
      cancelled: { 
        color: "bg-red-100 text-red-700 border border-red-200", 
        text: "Dibatalkan",
        icon: FiXCircle
      },
    };

    const config = statusMap[displayStatus] || statusMap.pending;
    const IconComponent = config.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  // Helper function untuk delivery status text
  const getDeliveryStatusText = (orderStatus) => {
    switch (orderStatus) {
      case 'courier_assigned':
        return "Kurir Ditetapkan";
      case 'picked_by_courier':
        return "Pesanan Diambil";
      case 'on_the_way':
        return "Dalam Perjalanan";
      default:
        return "Dalam Pengiriman";
    }
  };

  // Helper function untuk delivery status icon
  const getDeliveryStatusIcon = (orderStatus) => {
    switch (orderStatus) {
      case 'courier_assigned':
        return FiUserCheck;
      case 'picked_by_courier':
        return FiPackage;
      case 'on_the_way':
        return FiTruck;
      default:
        return FiTruck;
    }
  };

  // OrderTypeBadge component
  const OrderTypeBadge = ({ type }) => {
    const typeMap = {
      delivery: { 
        color: "bg-blue-50 text-blue-700 border border-blue-200", 
        text: "Delivery",
        icon: FiHome
      },
      takeaway: { 
        color: "bg-purple-50 text-purple-700 border border-purple-200", 
        text: "Take Away",
        icon: FiPackage
      },
      dinein: { 
        color: "bg-orange-50 text-orange-700 border border-orange-200", 
        text: "Dine In",
        icon: FiCoffee
      },
    };
    
    const config = typeMap[type] || typeMap.dinein;
    const IconComponent = config.icon;
    
    return (
      <span className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${config.color}`}>
        <IconComponent size={12} />
        {config.text}
      </span>
    );
  };

  // DeliveryProgress component untuk menampilkan progress pengiriman
  const DeliveryProgress = ({ order }) => {
    if (order.order_type !== 'delivery') return null;

    const steps = [
      { status: 'processed', label: 'Dimasak', icon: FiPackage },
      { status: 'courier_assigned', label: 'Kurir', icon: FiUserCheck },
      { status: 'picked_by_courier', label: 'Diambil', icon: FiMapPin },
      { status: 'on_the_way', label: 'Diantar', icon: FiTruck },
      { status: 'delivered', label: 'Sampai', icon: FiCheckCircle },
    ];

    const currentStepIndex = steps.findIndex(step => 
      step.status === order.order_status || 
      (step.status === 'processed' && ['pending', 'processed'].includes(order.order_status))
    );

    return (
      <div className="mt-3">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  isCompleted 
                    ? 'bg-[#E2A22A] text-white' 
                    : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'ring-2 ring-[#E2A22A] ring-offset-1' : ''}`}>
                  <IconComponent size={12} />
                </div>
                <span className={`text-xs mt-1 text-center ${
                  isCompleted ? 'text-[#E2A22A] font-medium' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center px-4">
          {steps.slice(0, -1).map((_, index) => (
            <div 
              key={index}
              className={`h-1 flex-1 mx-1 ${
                index < currentStepIndex ? 'bg-[#E2A22A]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Filter orders based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => getOrderDisplayStatus(order) === activeTab));
    }
  }, [activeTab, orders]);

  // Calculate tab counts
  const getTabCount = (tabId) => {
    if (tabId === "all") return orders.length;
    return orders.filter(order => getOrderDisplayStatus(order) === tabId).length;
  };

  // Fetch data dari API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch("http://127.0.0.1:8000/api/orders/history", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        if (data.success) {
          const sortedOrders = data.data.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setOrders(sortedOrders);
        } else {
          console.error("Gagal mengambil data:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E2A22A] mr-3"></div>
        Memuat riwayat pesanan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Riwayat Pesanan
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Lacak semua pesanan Anda dengan status yang akurat dan terperinci
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              const count = getTabCount(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 border-2 ${
                    isActive
                      ? "bg-[#E2A22A] border-[#E2A22A] text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-600 hover:border-[#E2A22A] hover:text-gray-900 hover:shadow-sm"
                  }`}
                >
                  <div className="relative mb-1">
                    <IconComponent 
                      size={20} 
                      className={isActive ? "text-white" : tab.color} 
                    />
                    {count > 0 && (
                      <span className={`absolute -top-2 -right-2 text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-semibold ${
                        isActive 
                          ? "bg-white text-[#E2A22A]" 
                          : "bg-[#E2A22A] text-white"
                      }`}>
                        {count}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum ada pesanan
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all" 
                  ? "Anda belum memiliki riwayat pesanan" 
                  : `Tidak ada pesanan dengan status "${tabs.find(tab => tab.id === activeTab)?.label}"`
                }
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#E2A22A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d19425] transition duration-200"
              >
                <FiShoppingBag size={18} />
                Pesan Sekarang
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Header dengan Order ID dan Status */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg truncate">
                        #{order.order_id}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <FiClock size={14} />
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <StatusBadge order={order} />
                  </div>

                  {/* Payment Method dan Order Type */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <PaymentMethodBadge method={order.payment_method} />
                      <OrderTypeBadge type={order.order_type} />
                    </div>
                  </div>

                  {/* Progress bar untuk delivery orders */}
                  {order.order_type === 'delivery' && order.payment_status === 'paid' && (
                    <DeliveryProgress order={order} />
                  )}
                </div>

                {/* Order Type dan Additional Info */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <span className="font-bold text-gray-900 text-lg block">
                        Rp {order.total_amount.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.items.length} item
                      </span>
                    </div>
                  </div>

                  {/* Additional info berdasarkan order type */}
                  {order.order_type === "dinein" && order.meja && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <FiUser size={14} className="text-gray-400" />
                        <span>
                          <span className="font-medium">Meja:</span> {order.meja.table_number}
                        </span>
                      </p>
                    </div>
                  )}

                  {order.order_type === "delivery" && order.shipping_address && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <FiHome size={14} className="text-gray-400 mt-0.5" />
                        <span className="flex-1">
                          <span className="font-medium">Alamat:</span> 
                          <span className="block text-xs mt-1 text-gray-600 line-clamp-2">
                            {order.shipping_address}
                          </span>
                        </span>
                      </p>
                    </div>
                  )}

                  {order.order_type === "takeaway" && order.pickup_time && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <FiPackage size={14} className="text-gray-400" />
                        <span>
                          <span className="font-medium">Pickup:</span> {order.pickup_time}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="p-4 flex-1">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-sm text-gray-700">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 block truncate">
                              {item.quantity}x {item.product?.name}
                            </span>
                            {item.variant && (
                              <p className="text-gray-500 text-xs mt-1">
                                Varian: {item.variant.name}
                              </p>
                            )}
                          </div>
                          <span className="text-gray-900 font-medium whitespace-nowrap">
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                        +{order.items.length - 3} item lainnya
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer dengan Tombol Detail */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                  <Link 
                    href={`/order-detail/${order.order_id}`} 
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-[#E2A22A] border border-[#E2A22A] px-4 py-2.5 rounded-lg hover:bg-[#E2A22A] hover:text-white transition duration-200 w-full"
                  >
                    Lihat Detail Pesanan
                    <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}