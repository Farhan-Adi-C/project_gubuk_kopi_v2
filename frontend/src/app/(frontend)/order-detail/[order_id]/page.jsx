'use client'
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuthToken } from "@/lib/get-token-user";
import {
  FaReceipt,
  FaTable,
  FaMotorcycle,
  FaBagShopping,
  FaRegCopy,
  FaLocationPin,
  FaFilePdf
} from "react-icons/fa6";
import {
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCafeOutline,
  IoCheckmark,
  IoArrowBack,
} from "react-icons/io5";

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.order_id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Fetch order detail from API
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch(`http://127.0.0.1:8000/api/order/history/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        
        const data = await res.json();
        
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || "Gagal mengambil data order");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Terjadi kesalahan saat mengambil data order");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Copy order ID function
  const handleCopy = () => {
    if (order?.order_id) {
      navigator.clipboard.writeText(order.order_id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle payment for Midtrans orders
  const handlePayment = async () => {
    if (!order?.snap_token) {
      alert('Token pembayaran tidak tersedia');
      return;
    }

    try {
      setPayLoading(true);
      
      if (!window.snap) {
        // Load Midtrans script if not loaded
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

        if (!document.querySelector(`script[src="${snapScript}"]`)) {
          const script = document.createElement('script');
          script.src = snapScript;
          script.setAttribute('data-client-key', clientKey);
          script.async = true;
          
          script.onload = () => {
            window.snap.pay(order.snap_token, {
              onSuccess: function(result) {
                console.log('Payment success:', result);
                alert('Pembayaran berhasil!');
                window.location.reload();
              },
              onPending: function(result) {
                console.log('Payment pending:', result);
                alert('Menunggu pembayaran...');
                window.location.reload();
              },
              onError: function(result) {
                console.log('Payment error:', result);
                alert('Terjadi kesalahan saat proses pembayaran.');
              },
              onClose: function() {
                console.log('Payment popup closed');
                alert('Pembayaran dibatalkan.');
              }
            });
          };
          document.body.appendChild(script);
        }
      } else {
        // Snap already loaded
        window.snap.pay(order.snap_token, {
          onSuccess: function(result) {
            console.log('Payment success:', result);
            alert('Pembayaran berhasil!');
            window.location.reload();
          },
          onPending: function(result) {
            console.log('Payment pending:', result);
            alert('Menunggu pembayaran...');
            window.location.reload();
          },
          onError: function(result) {
            console.log('Payment error:', result);
            alert('Terjadi kesalahan saat proses pembayaran.');
          },
          onClose: function() {
            console.log('Payment popup closed');
            alert('Pembayaran dibatalkan.');
          }
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Gagal memproses pembayaran: ' + error.message);
    } finally {
      setPayLoading(false);
    }
  };

  // Export to PDF function - Manual generation tanpa html2canvas
  const exportToPDF = async () => {
    try {
      setPdfLoading(true);
      
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 15;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(234, 88, 12); // Orange color
      pdf.text('GUBUK KOPI', pageWidth / 2, yPosition, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      yPosition += 8;
      pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;

      // Order Information
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      // Order ID and Date
      pdf.text(`Nomor Pesanan: ${order.order_id}`, 15, yPosition);
      pdf.text(`Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`, pageWidth - 15, yPosition, { align: 'right' });
      
      yPosition += 8;
      pdf.text(`Waktu: ${new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 15, yPosition, { align: 'right' });
      
      yPosition += 15;

      // Order Details Box
      pdf.setDrawColor(234, 88, 12);
      pdf.setFillColor(255, 247, 237);
      pdf.rect(15, yPosition, pageWidth - 30, 40, 'F');
      pdf.rect(15, yPosition, pageWidth - 30, 40, 'S');
      
      const boxContentY = yPosition + 10;
      
      // Total Amount
      pdf.setFontSize(16);
      pdf.setTextColor(234, 88, 12);
      pdf.text(`Rp ${order.total_amount.toLocaleString('id-ID')}`, 25, boxContentY);
      
      // Order Type
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Metode: ${getOrderTypeText(order.order_type, order.meja)}`, 25, boxContentY + 8);
      
      // Status
      pdf.text(`Status: ${getStatusText(order.payment_status, order.order_status, order.order_type)}`, 25, boxContentY + 16);
      
      // Shipping Address if exists
      if (order.shipping_address) {
        pdf.text(`Alamat: ${order.shipping_address}`, 25, boxContentY + 24);
      }

      yPosition += 50;

      // Items Header
      pdf.setFontSize(12);
      pdf.setTextColor(234, 88, 12);
      pdf.text('DETAIL PESANAN', 15, yPosition);
      
      yPosition += 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      
      yPosition += 10;

      // Items List
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      order.items.forEach((item, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const itemName = item.product?.name || 'Produk';
        const quantity = item.quantity;
        const price = item.price;
        const total = quantity * price;
        const variant = item.variant ? ` (${item.variant.name})` : '';
        
        pdf.text(`${itemName}${variant}`, 20, yPosition);
        pdf.text(`x${quantity}`, pageWidth - 60, yPosition);
        pdf.text(`Rp ${total.toLocaleString('id-ID')}`, pageWidth - 20, yPosition, { align: 'right' });
        
        yPosition += 6;
      });

      yPosition += 10;

      // Total Line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(pageWidth - 80, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setTextColor(234, 88, 12);
      pdf.text('TOTAL:', pageWidth - 70, yPosition);
      pdf.text(`Rp ${order.total_amount.toLocaleString('id-ID')}`, pageWidth - 20, yPosition, { align: 'right' });

      yPosition += 20;

      // Timeline if available
      if (order.order_type === "delivery" || order.payment_status === 'paid') {
        const timeline = generateTimeline(order);
        
        pdf.setFontSize(12);
        pdf.setTextColor(234, 88, 12);
        pdf.text('STATUS PESANAN', 15, yPosition);
        
        yPosition += 15;
        
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        
        timeline.forEach((item, index) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          
          const status = item.done ? '✓' : '○';
          pdf.text(`${status} ${item.status}`, 20, yPosition);
          pdf.text(item.time !== "-" ? `${item.time} WIB` : "Menunggu...", pageWidth - 20, yPosition, { align: 'right' });
          
          yPosition += 7;
        });
      }

      yPosition += 15;

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Terima kasih telah berbelanja di Gubuk Kopi', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Invoice ini sah sebagai bukti transaksi', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, yPosition, { align: 'center' });

      // Save PDF
      const fileName = `invoice-${order.order_id}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF: ' + error.message);
    } finally {
      setPdfLoading(false);
    }
  };

  // Helper function untuk teks order type
  const getOrderTypeText = (orderType, meja) => {
    switch (orderType) {
      case "dinein":
        return meja ? `Dine-in (Meja ${meja.table_number})` : 'Dine-in';
      case "takeaway":
        return "Take Away";
      case "delivery":
        return "Delivery";
      default:
        return orderType;
    }
  };

  // Generate timeline based on order status and timestamps
  const generateTimeline = (orderData) => {
    if (!orderData) return [];
    
    const { order_status, status_timestamps, order_type, created_at } = orderData;
    
    const baseTimeline = [
      { 
        status: "Pesanan Dibuat", 
        time: new Date(created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        done: true 
      },
    ];

    // Common statuses for all order types
    if (order_status !== 'pending') {
      baseTimeline.push({
        status: "Diproses Kitchen",
        time: status_timestamps?.processed ? 
          new Date(status_timestamps.processed).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
        done: ['processed', 'completed', 'delivered', 'courier_assigned', 'picked_by_courier', 'on_the_way'].includes(order_status)
      });
    }

    // Delivery specific statuses
    if (order_type === 'delivery') {
      if (order_status === 'courier_assigned' || order_status === 'picked_by_courier' || order_status === 'on_the_way' || order_status === 'delivered') {
        baseTimeline.push({
          status: "Kurir Ditetapkan",
          time: status_timestamps?.courier_assigned ? 
            new Date(status_timestamps.courier_assigned).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
          done: ['courier_assigned', 'picked_by_courier', 'on_the_way', 'delivered'].includes(order_status)
        });
      }

      if (order_status === 'picked_by_courier' || order_status === 'on_the_way' || order_status === 'delivered') {
        baseTimeline.push({
          status: "Pesanan Diambil Kurir",
          time: status_timestamps?.picked_by_courier ? 
            new Date(status_timestamps.picked_by_courier).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
          done: ['picked_by_courier', 'on_the_way', 'delivered'].includes(order_status)
        });
      }

      if (order_status === 'on_the_way' || order_status === 'delivered') {
        baseTimeline.push({
          status: "Dalam Perjalanan",
          time: status_timestamps?.on_the_way ? 
            new Date(status_timestamps.on_the_way).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
          done: ['on_the_way', 'delivered'].includes(order_status)
        });
      }
    }

    // Final status
    if (order_status === 'completed' || order_status === 'delivered') {
      baseTimeline.push({
        status: order_type === 'delivery' ? "Pesanan Sampai" : "Pesanan Selesai",
        time: status_timestamps?.completed || status_timestamps?.delivered ? 
          new Date(status_timestamps.completed || status_timestamps.delivered).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
        done: true
      });
    }

    if (order_status === 'cancelled') {
      baseTimeline.push({
        status: "Pesanan Dibatalkan",
        time: status_timestamps?.cancelled ? 
          new Date(status_timestamps.cancelled).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
        done: true
      });
    }

    return baseTimeline;
  };

  // Get current status for display
  const getCurrentStatus = (timeline) => {
    if (!timeline || timeline.length === 0) return { status: "Memuat...", time: "-" };
    
    const lastDoneStatus = [...timeline].reverse().find(item => item.done);
    return lastDoneStatus || timeline[0];
  };

  // Get method icon
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

  // Get status badge color
  const getStatusColor = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (paymentStatus === 'failed' || paymentStatus === 'expired' || orderStatus === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    if (orderStatus === 'completed' || orderStatus === 'delivered') return 'bg-green-100 text-green-800 border-green-200';
    if (orderStatus === 'processed') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status text
  const getStatusText = (paymentStatus, orderStatus, orderType) => {
    if (paymentStatus === 'pending') return 'Menunggu Pembayaran';
    if (paymentStatus === 'failed') return 'Pembayaran Gagal';
    if (paymentStatus === 'expired') return 'Pembayaran Kadaluarsa';
    
    switch (orderStatus) {
      case 'pending': return 'Menunggu Konfirmasi';
      case 'processed': return 'Sedang Diproses';
      case 'completed': return orderType === 'delivery' ? 'Terkirim' : 'Selesai';
      case 'delivered': return 'Terkirim';
      case 'courier_assigned': return 'Kurir Ditetapkan';
      case 'picked_by_courier': return 'Pesanan Diambil';
      case 'on_the_way': return 'Dalam Perjalanan';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Dalam Proses';
    }
  };

  // Check if payment button should be shown
  const shouldShowPaymentButton = () => {
    return order?.payment_method === 'midtrans' && 
           order?.payment_status === 'pending' && 
           order?.snap_token;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E2A22A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => router.push('/historyOrder')}
            className="mt-4 bg-[#E2A22A] text-white px-6 py-2 rounded-lg hover:bg-[#d18f1f] transition flex items-center gap-2 mx-auto"
          >
            <IoArrowBack className="w-4 h-4" />
            Kembali ke Order History
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Tidak Ditemukan</h1>
          <p className="text-gray-600">Order ID yang diminta tidak ditemukan</p>
          <button 
            onClick={() => router.push('/historyOrder')}
            className="mt-4 bg-[#E2A22A] text-white px-6 py-2 rounded-lg hover:bg-[#d18f1f] transition flex items-center gap-2 mx-auto"
          >
            <IoArrowBack className="w-4 h-4" />
            Kembali ke Order History
          </button>
        </div>
      </div>
    );
  }

  const timeline = generateTimeline(order);
  const currentStatus = getCurrentStatus(timeline);

  return (
    <div className="px-4 max-w-6xl mx-auto py-28 md:py-28 font-sans">
      {/* HEADER WITH BACK BUTTON & PDF EXPORT */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FaReceipt className="text-4xl text-orange-600 drop-shadow-md" />
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
            Detail Pesanan
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToPDF}
            disabled={pdfLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {pdfLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Membuat PDF...
              </>
            ) : (
              <>
                <FaFilePdf className="w-4 h-4" />
                Export PDF
              </>
            )}
          </button>
          
          <button 
            onClick={() => router.push('/historyOrder')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 border border-gray-300"
          >
            <IoArrowBack className="w-4 h-4" />
            Kembali ke History
          </button>
        </div>
      </div>

      {/* CONTENT - TANPA PERUBAHAN */}
      <div
        className={`grid grid-cols-1 gap-8 ${
          order.order_type === "delivery" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {/* LEFT COLUMN: SUMMARY & ITEMS */}
        <div
          className={`space-y-8 ${
            order.order_type === "delivery" ? "lg:col-span-2" : "lg:col-span-2"
          }`}
        >
          {/* SUMMARY CARD */}
          <div className="bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-3xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Total Pembayaran
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* ORDER ID & COPY BUTTON */}
              <div className="flex flex-col items-end">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Nomor Pesanan
                </p>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  <p className="font-bold text-gray-800 text-base">
                    {order.order_id}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition duration-150 active:scale-95"
                    title="Salin Nomor Pesanan"
                  >
                    <FaRegCopy className="w-4 h-4" />
                  </button>
                </div>
                {copySuccess && (
                  <span className="text-green-600 text-sm mt-1 font-medium">
                    ✓ Disalin!
                  </span>
                )}
              </div>
            </div>

            <p className="text-5xl font-extrabold mb-6 text-orange-700 tracking-tight">
              Rp {order.total_amount.toLocaleString("id-ID")}
            </p>

            {/* STATUS & METHOD INFO */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-orange-100 rounded-2xl border border-orange-200">
                <div className="p-3 bg-orange-300 rounded-xl text-orange-900">
                  {getMethodIcon(order.order_type)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Metode Pesanan
                  </p>
                  <p className="text-lg font-bold text-orange-900">
                    {order.order_type === "dinein" && order.meja &&
                      `Dine-in (Meja ${order.meja.table_number})`}
                    {order.order_type === "takeaway" && "Take Away"}
                    {order.order_type === "delivery" && "Delivery"}
                  </p>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div className={`flex items-center gap-4 p-4 rounded-2xl border ${getStatusColor(order.payment_status, order.order_status)}`}>
                <div className="p-3 bg-white rounded-xl">
                  <IoCafeOutline className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Status Pesanan
                  </p>
                  <p className="text-lg font-bold">
                    {getStatusText(order.payment_status, order.order_status, order.order_type)}
                  </p>
                </div>
              </div>

              {/* SHIPPING ADDRESS - Conditional */}
              {order.shipping_address && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="p-3 bg-blue-300 rounded-xl text-blue-900">
                    <FaLocationPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Alamat Pengiriman
                    </p>
                    <p className="text-gray-800">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              )}

              {/* PAYMENT BUTTON - Conditional */}
              {shouldShowPaymentButton() && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Pembayaran Tertunda
                      </p>
                      <p className="text-yellow-700">
                        Silakan selesaikan pembayaran untuk melanjutkan pesanan
                      </p>
                    </div>
                    <button
                      onClick={handlePayment}
                      disabled={payLoading}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {payLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Memuat...
                        </>
                      ) : (
                        <>
                          <FaReceipt className="w-4 h-4" />
                          Bayar Sekarang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
            <h2 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">
              Detail Item Dipesan ☕
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    {item.product?.image ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${item.product.image}`}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-md ring-1 ring-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center shadow-md">
                        <IoCafeOutline className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.product?.name || "Produk"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Jumlah: <strong>x{item.quantity}</strong>
                        {item.variant && (
                          <span className="ml-2">• Varian: {item.variant.name}</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rp {item.price.toLocaleString('id-ID')} per item
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-gray-800 text-lg">
                    Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 text-lg">Total</span>
                <span className="font-bold text-orange-700 text-xl">
                  Rp {order.total_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — TIMELINE (Conditional) */}
        {(order.order_type === "delivery" || order.payment_status === 'paid') && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg lg:col-span-1">
            <h2 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">
              {order.order_type === "delivery" ? "Status Pengiriman 🛵" : "Status Pesanan 📦"}
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
              {timeline.map((item, i) => {
                const currentStatusIndex = timeline.findIndex(item => !item.done);
                const isCurrent = i === currentStatusIndex;
                const isPast = item.done;
                const isFuture = !item.done && i > currentStatusIndex;
                
                return (
                  <div key={i} className="flex items-start gap-4 relative z-10">
                    {/* DOT */}
                    <div
                      className={`w-8 h-8 rounded-full absolute -left-0.5 transform -translate-x-1/2 flex items-center justify-center transition-all duration-300
                        ${
                          isPast
                            ? "bg-green-600 text-white shadow-xl shadow-green-200"
                            : isCurrent
                            ? "bg-orange-500 text-white border-4 border-orange-200 shadow-lg"
                            : "bg-white border-2 border-gray-300 text-gray-400"
                        }`}
                    >
                      {isPast ? (
                        <IoCheckmark className="w-5 h-5" />
                      ) : (
                        <IoTimeOutline className="w-5 h-5" />
                      )}
                    </div>

                    <div className="ml-4 pt-1">
                      <p
                        className={`font-bold ${
                          isPast || isCurrent ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {item.status}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">
                        {item.time !== "-" ? `${item.time} WIB` : "Menunggu..."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}