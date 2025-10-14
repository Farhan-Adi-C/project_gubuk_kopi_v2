"use client";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/get-token-user";
import { FiShoppingBag } from "react-icons/fi";

export default function HistoryOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const StatusBadge = ({ status }) => {
    const map = {
      paid: { color: "bg-green-100 text-green-700", text: "Selesai" },
      pending: {
        color: "bg-yellow-100 text-yellow-700",
        text: "Menunggu Pembayaran",
      },
      cancelled: { color: "bg-red-100 text-red-700", text: "Dibatalkan" },
    };
    const cfg = map[status] || map.pending;
    return (
      <span
        className={`px-3 py-1 text-xs rounded-full font-medium ${cfg.color}`}>
        {cfg.text}
      </span>
    );
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
          setOrders(data.data);
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
        Memuat riwayat pesanan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32 px-5 md:px-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Riwayat Pesanan
        </h1>
        <p className="text-gray-600">
          Semua transaksi kamu tercatat di sini lengkap dengan detail produk.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 text-[#E2A22A] p-4 rounded-full">
                <FiShoppingBag size={40} />
              </div>
            </div>

            <p className="text-gray-600 mb-4">Kamu belum memiliki pesanan.</p>
            <button className="bg-[#E2A22A] hover:bg-[#cf9324] text-white px-6 py-3 rounded-lg font-medium">
              Pesan Sekarang
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      #{order.order_id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.payment_status} />
                </div>

                <div className="border-t border-gray-200 mt-2 pt-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>
                          {item.quantity}x {item.product?.name}
                        </span>
                        <span>Rp {item.price.toLocaleString("id-ID")}</span>
                      </div>
                      {item.variant && (
                        <p className="text-gray-500 text-xs ml-5 italic">
                          Varian: {item.variant.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-start mt-4">
                  <span className="font-semibold text-gray-900">
                    Total: Rp {order.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
