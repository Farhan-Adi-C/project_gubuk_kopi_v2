'use client'
import {
  FaReceipt,
  FaTable,
  FaMotorcycle,
  FaBagShopping,
  FaRegCopy, // Import ikon copy
} from "react-icons/fa6";

import {
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCafeOutline,
  IoCheckmark,
} from "react-icons/io5";

export default function OrderDetail() {
  const order = {
    method: "takeaway", // dinein | takeaway | delivery
    tableNumber: 7,
    orderId: "INV-2025-991",
    total: 54000,
    date: "21 Nov 2025, 14:33",
  };

  // Tambahkan item yang harganya jika ditotal = 54000
  const items = [
    {
      name: "Americano (Reguler)",
      quantity: 2,
      price: 18000,
      img: "https://cdn.rri.co.id/berita/Kendari/o/1729660839165-americano_b74a8154-454b-4f74-9a6c-95fbc4152ed3/67sqf0h03mpqcx9.webp",
    },
    {
      name: "Chocolate Croissant",
      quantity: 1,
      price: 18000,
      img: "https://www.mashed.com/img/gallery/why-croissants-are-so-expensive/intro-1616590210.jpg",
    },
  ];

  const timeline = [
    { status: "Pesanan Dibuat", time: "14:33", done: true },
    { status: "Diproses Barista", time: "14:36", done: true },
    { status: "Diambil Kurir", time: "14:50", done: true },
    { status: "Dalam Perjalanan", time: "15:10", done: false },
    { status: "Pesanan Sampai", time: "-", done: false },
  ];

  // Logic untuk menentukan status saat ini
  const currentStatusIndex = timeline.findIndex((item) => !item.done);
  const currentStatus =
    currentStatusIndex === -1
      ? timeline[timeline.length - 1]
      : timeline[currentStatusIndex - 1] || timeline[0];

  const getMethodIcon = (method) => {
    switch (method) {
      case "dinein":
        return <FaTable className="w-5 h-5" />;
      case "takeaway":
        return <FaBagShopping className="w-5 h-5" />;
      case "delivery":
        return <FaMotorcycle className="w-5 h-5" />;
      default:
        return <FaReceipt className="w-5 h-5" />;
    }
  };

//   PENTING: Untuk fungsi copy sebenarnya, Anda akan menggunakan Clipboard API,
//   seperti ini:
  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderId);
    alert("Order ID disalin!");
  };

  return (
    <div className="px-4 max-w-6xl mx-auto py-28 md:py-28 font-sans">
      {/* TITLE */}
      <div className="flex items-center gap-3 mb-12">
        <FaReceipt className="text-4xl text-orange-600 drop-shadow-md" />
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
          Detail Pesanan
        </h1>
      </div>

      <div
        className={`grid grid-cols-1 gap-8 ${
          order.method === "delivery" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {/* LEFT COLUMN: SUMMARY & ITEMS */}
        <div
          className={`space-y-8 ${
            order.method === "delivery" ? "lg:col-span-2" : "lg:col-span-2"
          }`}
        >
          {/* SUMMARY CARD (Warna Oranye/Cokelat) */}
          <div className="bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-3xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Total Pembayaran
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {order.date}
                </span>
              </div>
              {/* ORDER ID & COPY BUTTON MODIFICATION HERE */}
              <div className="flex flex-col items-end">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Nomor Pesanan
                </p>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  <p className="font-bold text-gray-800 text-base">
                    {order.orderId}
                  </p>
                  {/* Copy Button */}
                  <button
                    onClick={handleCopy} // Uncomment ini jika state/logic sudah ada
                    className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition duration-150 active:scale-95"
                    title="Salin Nomor Pesanan"
                  >
                    <FaRegCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-5xl font-extrabold mb-6 text-orange-700 tracking-tight">
              Rp {order.total.toLocaleString("id-ID")}
            </p>

            {/* STATUS TAG */}
            <div className="flex items-center gap-4 p-4 bg-orange-100 rounded-2xl border border-orange-200">
              <div className="p-3 bg-orange-300 rounded-xl text-orange-900">
                {getMethodIcon(order.method)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Metode Pesanan
                </p>
                <p className="text-lg font-bold text-orange-900">
                  {order.method === "dinein" &&
                    `Dine-in (Meja #${order.tableNumber})`}
                  {order.method === "takeaway" && "Take Away"}
                  {order.method === "delivery" && "Delivery"}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
            <h2 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">
              Detail Item Dipesan ☕
            </h2>

            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-md ring-1 ring-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Jumlah: **x{item.quantity}**
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-gray-800">
                    Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — DELIVERY TIMELINE (Conditional) */}
        {order.method === "delivery" && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg lg:col-span-1">
            <h2 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">
              Status Pengiriman 🛵
            </h2>

            {/* Current Status Display */}
            <div className="bg-orange-50 p-4 rounded-xl mb-6 text-center border border-orange-200">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Status Saat Ini
              </p>
              <p className="text-xl font-extrabold text-orange-800 flex items-center justify-center gap-2">
                <IoCafeOutline className="w-6 h-6" />
                {currentStatus.status}
              </p>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 space-y-8">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-4"></div>
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-4 relative z-10">
                  {/* DOT */}
                  <div
                    className={`w-8 h-8 rounded-full absolute -left-0.5 transform -translate-x-1/2 flex items-center justify-center transition-all duration-300
                      ${
                        item.done
                          ? "bg-green-600 text-white shadow-xl shadow-green-200" // Status Selesai (Hijau/Done)
                          : i === currentStatusIndex
                          ? "bg-orange-500 text-white border-4 border-orange-200 shadow-lg" // Status Berlangsung (Oranye/Aksen)
                          : "bg-white border-2 border-gray-300 text-gray-400" // Status Menunggu
                      }`}
                  >
                    {item.done ? (
                      <IoCheckmark className="w-5 h-5" />
                    ) : (
                      <IoTimeOutline className="w-5 h-5" />
                    )}
                  </div>

                  <div className="ml-4 pt-1">
                    <p
                      className={`font-bold ${
                        item.done ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </p>
                    <p className="text-sm text-gray-400 font-medium">
                      {item.time !== "-" ? `${item.time} WIB` : "Menunggu..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}