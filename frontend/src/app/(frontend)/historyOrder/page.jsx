'use client';
import { useState } from 'react';

export default function HistoryOrder() {
  const orders = [
    {
      id: 'ORD-123456',
      date: '10 Okt 2025',
      status: 'completed',
      total: 61000,
      items: [
        { name: 'Kopi Latte', quantity: 1, price: 25000, variant: 'Jumbo + Extra Es' },
        { name: 'Croissant Cokelat', quantity: 2, price: 18000 },
      ],
    },
    {
      id: 'ORD-123457',
      date: '8 Okt 2025',
      status: 'pending',
      total: 42000,
      items: [
        { name: 'Espresso', quantity: 1, price: 22000 },
        { name: 'Donat Gula', quantity: 1, price: 20000, variant: 'Topping Cokelat' },
      ],
    },
    {
      id: 'ORD-123458',
      date: '5 Okt 2025',
      status: 'cancelled',
      total: 54000,
      items: [{ name: 'Americano', quantity: 2, price: 27000 }],
    },
  ];

  const StatusBadge = ({ status }) => {
    const map = {
      completed: { color: 'bg-green-100 text-green-700', text: 'Selesai' },
      pending: { color: 'bg-yellow-100 text-yellow-700', text: 'Menunggu' },
      cancelled: { color: 'bg-red-100 text-red-700', text: 'Dibatalkan' },
    };
    const cfg = map[status] || map.pending;
    return (
      <span className={`px-3 py-1 text-xs rounded-full font-medium ${cfg.color}`}>
        {cfg.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-32 px-5 md:px-10">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Pesanan</h1>
        <p className="text-gray-600">
          Lihat semua pesanan kamu di sini. Setiap transaksi tercatat dengan detail lengkap.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">#{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="border-t border-gray-200 mt-2 pt-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>Rp {item.price.toLocaleString('id-ID')}</span>
                      </div>
                      {item.variant && (
                        <p className="text-gray-500 text-xs ml-5 italic">
                          Varian: {item.variant}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-start mt-4">
                  <span className="font-semibold text-gray-900">
                    Total: Rp {order.total.toLocaleString('id-ID')}
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
