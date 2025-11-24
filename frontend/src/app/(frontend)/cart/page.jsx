"use client";
import { getAuthToken } from "@/lib/get-token-user";
import { Bitter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaCreditCard, FaTruck, FaSpinner, FaTrash, FaMoneyBill1Wave, FaClock, FaTable, FaStore, FaMotorcycle } from "react-icons/fa6";
import { TbShoppingCartX } from "react-icons/tb";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-bitter",
});

async function getCart() {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("User belum login");

    const res = await fetch("http://localhost:8000/api/cart", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Gagal mengambil cart`);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAvailableMejas() {
  try {
    const token = await getAuthToken();
    const res = await fetch("http://localhost:8000/api/mejas/available", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Gagal mengambil data meja`);
    
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateCartQuantity(cartId, quantity) {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("User belum login");

    const res = await fetch(`http://localhost:8000/api/cart/update/${cartId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Gagal update quantity`);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function removeFromCart(cartId) {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("User belum login");

    const res = await fetch(`http://localhost:8000/api/cart/remove/${cartId}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Gagal menghapus item`);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkout(orderData) {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("User belum login");

    const res = await fetch("http://localhost:8000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Gagal checkout`);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedMeja, setSelectedMeja] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [availableMejas, setAvailableMejas] = useState([]);
  const [loadingMejas, setLoadingMejas] = useState(false);
  const snapScriptLoaded = useRef(false);
  const [orderMethod, setOrderMethod] = useState("dinein");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const router = useRouter();

  useEffect(() => {
    if (!snapScriptLoaded.current) {
      const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

      if (!document.querySelector(`script[src="${snapScript}"]`)) {
        const script = document.createElement('script');
        script.src = snapScript;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        
        script.onload = () => snapScriptLoaded.current = true;
        document.body.appendChild(script);
      } else {
        snapScriptLoaded.current = true;
      }
    }

    fetchCartData();
  }, []);

  useEffect(() => {
    if (orderMethod === "dinein") fetchAvailableMejas();
  }, [orderMethod]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getCart();
      if (result.success) {
        setCart(result.data?.data?.items || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Gagal memuat data keranjang");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMejas = async () => {
    try {
      setLoadingMejas(true);
      const result = await getAvailableMejas();
      if (result.success) setAvailableMejas(result.data || []);
    } catch (err) {
      setAvailableMejas([]);
    } finally {
      setLoadingMejas(false);
    }
  };

  const getAvailableStock = (item) => item.variant?.stock ?? item.product?.stock ?? 0;

  const handleIncreaseQuantity = async (cartId, currentQuantity, item) => {
    const availableStock = getAvailableStock(item);
    if (currentQuantity >= availableStock) {
      alert(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      return;
    }
    await updateQuantity(cartId, currentQuantity + 1, item);
  };

  const handleDecreaseQuantity = async (cartId, currentQuantity, item) => {
    if (currentQuantity <= 1) return;
    await updateQuantity(cartId, currentQuantity - 1, item);
  };

  const updateQuantity = async (cartId, newQuantity, item) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      
      const availableStock = getAvailableStock(item);
      if (newQuantity > availableStock) throw new Error(`Stok tidak mencukupi`);
      
      const result = await updateCartQuantity(cartId, newQuantity);
      if (result.success) {
        setCart(prevCart => 
          prevCart.map(cartItem => 
            cartItem.id === cartId 
              ? { 
                  ...cartItem, 
                  quantity: newQuantity, 
                  total_price_per_item: result.data.data.total_price_per_item 
                }
              : cartItem
          )
        );
      } else throw new Error(result.error);
    } catch (error) {
      alert(`Gagal update quantity: ${error.message}`);
      if (error.message.includes('Stok tidak mencukupi') && getAvailableStock(item) === 0) {
        await handleAutoRemoveItem(cartId, item);
      } else fetchCartData();
    } finally {
      setUpdatingItems(prev => new Set([...prev].filter(id => id !== cartId)));
    }
  };

  const handleAutoRemoveItem = async (cartId, item) => {
    try {
      const result = await removeFromCart(cartId);
      if (result.success) {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== cartId));
        alert(`Produk ${item.product?.name} dihapus dari keranjang karena stok habis`);
      }
    } catch (error) {
      setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== cartId));
    }
  };

  const handleDeleteItem = async (cartId, itemName = "item ini") => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Apakah Anda yakin ingin menghapus ${itemName} dari keranjang?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingItems(prev => new Set(prev).add(cartId));
      const response = await removeFromCart(cartId);

      if (response.success) {
        setCart(prevCart => prevCart.filter(item => item.id !== cartId));
        window.dispatchEvent(new Event("cartUpdated"));

        Swal.fire({
          icon: "success",
          title: "Berhasil Dihapus!",
          text: `${itemName} telah dihapus dari keranjang.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else throw new Error(response.error);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: error.message || "Terjadi kesalahan, silakan coba lagi.",
      });
    } finally {
      setDeletingItems(prev => new Set([...prev].filter(id => id !== cartId)));
    }
  };

  useEffect(() => {
    if (cart.length > 0) {
      const outOfStockItems = cart.filter(item => getAvailableStock(item) === 0);
      outOfStockItems.forEach(item => handleAutoRemoveItem(item.id, item));
    }
  }, [cart]);

  const validateForm = () => {
    if (cart.length === 0) {
      alert("Keranjang belanja kosong");
      return false;
    }

    const itemsWithInsufficientStock = cart.filter(item => item.quantity > getAvailableStock(item));
    if (itemsWithInsufficientStock.length > 0) {
      const itemNames = itemsWithInsufficientStock.map(item => 
        `${item.product?.name} (Stok: ${getAvailableStock(item)})`
      ).join(', ');
      alert(`Stok tidak mencukupi untuk produk berikut: ${itemNames}`);
      return false;
    }

    if (orderMethod === "delivery" && !shippingAddress.trim()) {
      alert("Mohon masukkan alamat pengiriman");
      return false;
    }
    
    if (orderMethod === "dinein" && !selectedMeja) {
      alert("Mohon pilih meja untuk dine in");
      return false;
    }
    
    if (orderMethod === "takeaway" && !pickupTime) {
      alert("Mohon pilih waktu pengambilan untuk take away");
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
  if (!validateForm()) return;

  // Periksa apakah Snap sudah loaded
  if (paymentMethod === "midtrans" && !window.snap) {
    alert("Sistem pembayaran sedang loading, silakan tunggu sebentar dan coba lagi");
    return;
  }

  try {
    setCheckoutLoading(true);
    
    const orderData = {
      order_type: orderMethod,
      payment_method: paymentMethod
    };

    if (orderMethod === "delivery") orderData.shipping_address = shippingAddress;
    else if (orderMethod === "dinein") orderData.meja_id = parseInt(selectedMeja);
    else if (orderMethod === "takeaway") orderData.pickup_time = pickupTime;

    const result = await checkout(orderData);
    
    if (result.success) {
      if (paymentMethod === "midtrans") {
        const snapToken = result.data.data.snap_token;
        if (!snapToken) throw new Error("Snap token tidak ditemukan");

        // Pastikan window.snap tersedia
        if (!window.snap) {
          throw new Error("Payment gateway belum siap, silakan refresh halaman");
        }

        window.snap.pay(snapToken, {
          onSuccess: function(result) {
            console.log('Payment success:', result);
            handleCheckoutSuccess(result.order_id);
          },
          onPending: function(result) {
            console.log('Payment pending:', result);
            router.push(`/orderConfirmation/${result.order_id}`);
          },
          onError: function(result) {
            console.log('Payment error:', result);
            alert("Terjadi kesalahan saat proses pembayaran.");
          },
          onClose: function() {
            console.log('Payment popup closed');
            alert("Pembayaran dibatalkan.");
          }
        });
      } else {
        const orderId = result.data.data.order_id || result.data.data.order?.order_id || result.data.data.id;
        handleCheckoutSuccess(orderId);
      }
    } else throw new Error(result.error);
  } catch (error) {
    console.error('Checkout error:', error);
    alert(`Gagal checkout: ${error.message}`);
  } finally {
    setCheckoutLoading(false);
  }
};

  const handleCheckoutSuccess = (orderId) => {
    alert("Pesanan berhasil dibuat! Pesanan Anda sedang diproses.");
    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
    setShippingAddress("");
    setSelectedMeja("");
    setPickupTime("");
    router.push(`/orderConfirmation/${orderId}`);
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const calculatePricePerItem = (item) => {
    if (!item.product) return 0;
    const discountAmount = item.product.price * (item.product.discount / 100);
    const priceAfterDiscount = item.product.price - discountAmount;
    const variantPrice = item.variant?.additional_price || 0;
    return priceAfterDiscount + variantPrice;
  };

  const subtotal = cart.reduce((acc, item) => acc + (calculatePricePerItem(item) * item.quantity), 0);
  let shipping = orderMethod === "delivery" ? 10000 : 0;
  let total = subtotal + shipping;

  if (orderMethod === "delivery" && subtotal >= 100000) {
    shipping = 0;
    total = subtotal;
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const closingHour = 22;
    
    let hour = currentHour;
    let minute = Math.ceil(currentMinute / 30) * 30;
    
    if (minute === 60) {
      hour += 1;
      minute = 0;
    }
    
    while (hour < closingHour || (hour === closingHour && minute === 0)) {
      options.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      minute += 30;
      if (minute === 60) {
        hour += 1;
        minute = 0;
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (loading) {
    return (
      <div className="max-w-full bg-[#F7F3F0] min-h-screen">
        <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
          <h2 className={`${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>Keranjang Belanja</h2>
        </div>
        <div className="max-w-4xl lg:max-w-full lg:px-20 mx-auto p-5 flex justify-center items-center min-h-60">
          <div className="flex items-center gap-2 text-gray-500">
            <FaSpinner className="animate-spin" />
            <p>Memuat keranjang...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full bg-[#F7F3F0] min-h-screen">
        <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
          <h2 className={`${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>Keranjang Belanja</h2>
        </div>
        <div className="max-w-4xl lg:max-w-full lg:px-20 mx-auto p-5 flex flex-col items-center justify-center min-h-60 gap-4">
          <p className="text-red-500 text-center">{error}</p>
          <div className="flex gap-2">
            <button onClick={fetchCartData} className="bg-[#E67E22] text-white px-4 py-2 rounded-lg hover:bg-[#cf6d13] transition">Coba Lagi</button>
            <Link href="/menu" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">Kembali Belanja</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full bg-[#F7F3F0] min-h-screen">
      <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
        <h2 className={`${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>Keranjang Belanja</h2>
        <p className="text-gray-600">Periksa kembali item sebelum lanjut ke pembayaran.</p>
      </div>

      <div className="max-w-4xl lg:max-w-full lg:px-20 mx-auto p-5 flex flex-col lg:flex-row gap-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-20 gap-4">
            <TbShoppingCartX className="text-6xl text-gray-400" />
            <p className="text-gray-500 text-lg text-center">Keranjang belanja Anda kosong.</p>
            <Link href="/menu" className="mt-4 bg-[#E67E22] text-white px-6 py-3 rounded-lg hover:bg-[#cf6d13] transition">Belanja Sekarang</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 lg:w-1/2">
              {cart.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                const isDeleting = deletingItems.has(item.id);
                const pricePerItem = calculatePricePerItem(item);
                const totalPricePerItem = pricePerItem * item.quantity;
                const availableStock = getAvailableStock(item);
                const isOutOfStock = availableStock === 0;

                return (
                  <div key={item.id} className={`flex items-center justify-between rounded-lg shadow-lg p-3 gap-3 ${isOutOfStock ? 'bg-red-50 border border-red-200' : 'bg-[#fdfdfd]'}`}>
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product?.image ? `http://localhost:8000/storage/${item.product.image}` : "/menu.jpg"}
                        alt={item.product?.name || "Product Image"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product?.name}
                        {isOutOfStock && <span className="ml-2 text-red-500 text-sm font-normal">(Stok Habis)</span>}
                      </h3>

                      {item.product?.discount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 line-through">{formatPrice(item.product?.price)}</span>
                          <span className="text-red-500 font-medium">{item.product?.discount}% OFF</span>
                        </div>
                      )}

                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          Varian: <span className="font-medium text-gray-800">{item.variant.name}</span>
                          {item.variant.additional_price > 0 && <span className="text-gray-500"> (+{formatPrice(item.variant.additional_price)})</span>}
                        </p>
                      )}

                      <p className="text-[#E67E22] font-medium">{formatPrice(pricePerItem)}</p>
                      <p className="text-gray-900 font-semibold">Total: {formatPrice(totalPricePerItem)}</p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      {!isOutOfStock ? (
                        <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-gray-50">
                          <button onClick={() => handleDecreaseQuantity(item.id, item.quantity, item)} disabled={isUpdating || item.quantity <= 1} className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50">−</button>
                          <span className="font-medium min-w-8 text-center">{isUpdating ? <FaSpinner className="animate-spin mx-auto" size={14} /> : item.quantity}</span>
                          <button onClick={() => handleIncreaseQuantity(item.id, item.quantity, item)} disabled={isUpdating || item.quantity >= availableStock} className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50">+</button>
                        </div>
                      ) : (
                        <p className="text-red-500 text-sm font-medium text-center">Stok Habis</p>
                      )}

                      <button onClick={() => handleDeleteItem(item.id, item.product?.name)} disabled={isDeleting} className="text-red-500 hover:text-red-700 disabled:opacity-50 transition flex items-center gap-1 text-sm">
                        {isDeleting ? <FaSpinner className="animate-spin" size={12} /> : <FaTrash size={12} />} Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:w-1/2 flex flex-col gap-6">
              <div className="bg-[#ffffff] rounded-xl shadow-xl p-5 border border-gray-200">
                <h3 className="font-bold mb-3 text-lg">Metode Pemesanan</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "dinein", label: "Dine In", icon: <FaStore size={22} /> },
                    { key: "takeaway", label: "Take Away", icon: <FaClock size={22} /> },
                    { key: "delivery", label: "Delivery", icon: <FaMotorcycle size={22} /> },
                  ].map((m) => (
                    <button key={m.key} onClick={() => setOrderMethod(m.key)} className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border font-medium transition-all ${orderMethod === m.key ? "bg-gradient-to-br from-[#E67E22] to-[#d96a17] text-white border-[#E67E22] shadow-md scale-[1.03]" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                      <div className={`p-2 rounded-full border transition-all ${orderMethod === m.key ? "bg-white text-[#E67E22] border-white" : "border-gray-300 text-gray-600"}`}>{m.icon}</div>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {orderMethod === "dinein" && (
                <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                  <label className="block mb-2 font-medium flex items-center gap-2"><FaTable className="text-[#E67E22]" />Pilih Meja *</label>
                  {loadingMejas ? (
                    <div className="flex items-center gap-2 text-gray-500"><FaSpinner className="animate-spin" /><p>Memuat meja tersedia...</p></div>
                  ) : availableMejas.length > 0 ? (
                    <select value={selectedMeja} onChange={(e) => setSelectedMeja(e.target.value)} className="w-full border rounded-md p-3 focus:outline-[#E67E22] bg-white" required>
                      <option value="">Pilih Meja</option>
                      {availableMejas.map((meja) => <option key={meja.id} value={meja.id}>Meja {meja.table_number} - Kapasitas: {meja.capacity} orang</option>)}
                    </select>
                  ) : <p className="text-red-500">Tidak ada meja tersedia saat ini</p>}
                </div>
              )}

              {orderMethod === "takeaway" && (
                <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                  <label className="block mb-2 font-medium flex items-center gap-2"><FaClock className="text-[#E67E22]" />Pilih Waktu Pengambilan *</label>
                  <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full border rounded-md p-3 focus:outline-[#E67E22] bg-white" required>
                    <option value="">Pilih Waktu</option>
                    {timeOptions.map((time) => <option key={time} value={time}>{time} WIB</option>)}
                  </select>
                </div>
              )}

              {orderMethod === "delivery" && (
                <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                  <label className="block mb-2 font-medium">Alamat Pengiriman *</label>
                  <textarea placeholder="Contoh: Jl. Merdeka No. 123, Jakarta Pusat" className="w-full border rounded-md p-3 focus:outline-[#E67E22]" rows={3} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required></textarea>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setPaymentMethod("cash")} className={`p-4 rounded-xl cursor-pointer border flex items-center gap-3 transition-all shadow-sm hover:shadow-lg ${paymentMethod === "cash" ? "bg-[#E67E22] text-white border-[#E67E22]" : "bg-white border-gray-300 text-gray-700"}`}>
                  <FaMoneyBill1Wave className="text-xl" />
                  <div><p className="font-semibold">Cash</p><p className="text-xs opacity-80">Bayar langsung</p></div>
                </div>

                <div onClick={() => setPaymentMethod("midtrans")} className={`p-4 rounded-xl cursor-pointer border flex items-center gap-3 transition-all shadow-sm hover:shadow-lg ${paymentMethod === "midtrans" ? "bg-[#2980B9] text-white border-[#2980B9]" : "bg-white border-gray-300 text-gray-700"}`}>
                  <FaCreditCard className="text-xl" />
                  <div><p className="font-semibold">Transfer Bank</p><p className="text-xs opacity-80">Bayar via bank atau e-wallet</p></div>
                </div>
              </div>

              <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                <h3 className="font-bold mb-4">Ringkasan Pesanan</h3>
                <div className="flex justify-between mb-2"><span>Subtotal ({totalItems} items)</span><span>{formatPrice(subtotal)}</span></div>
                {orderMethod === "delivery" && <div className="flex justify-between mb-2"><span>Biaya Pengiriman</span><span>{shipping === 0 ? <span className="text-green-600">GRATIS</span> : formatPrice(shipping)}</span></div>}
                <hr className="my-3 text-[#000000]/20" />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>

                <button onClick={handleCheckout} disabled={checkoutLoading || (orderMethod === "delivery" && !shippingAddress.trim()) || (orderMethod === "dinein" && !selectedMeja) || (orderMethod === "takeaway" && !pickupTime) || cart.some(item => getAvailableStock(item) === 0)} className="w-full mt-5 bg-[#E67E22] text-white py-3 rounded-lg hover:bg-[#cf6d13] disabled:opacity-50 transition flex items-center justify-center">
                  {checkoutLoading ? <><FaSpinner className="animate-spin mr-2" />Memproses Pembayaran...</> : <><FaCreditCard className="inline mr-2" />Lanjut Ke Pembayaran</>}
                </button>

                <Link href="/menu" className="block w-full mt-3 bg-transparent text-[#E2A22A] hover:text-white border-[#E2A22A] border-2 py-3 rounded-lg hover:bg-[#cf6d13] transition text-center">Kembali Belanja</Link>
                
                {orderMethod === "delivery" && (
                  <div className="flex flex-col mt-4 bg-[#FFF4E5] text-[#E67E22] rounded-lg p-4 gap-1 text-sm">
                    <div className="flex items-center mb-1"><FaTruck className="inline mr-2 text-lg" /><p className="text-black font-semibold">Gratis ongkir </p></div>
                    <div><p className="text-[#8B4513]">Dengan Minimal Pembelian Rp 100.000 dan maksimal 5KM</p></div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}