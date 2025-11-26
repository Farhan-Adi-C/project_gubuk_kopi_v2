"use client";
import { getAuthToken } from "@/lib/get-token-user";
import { Bitter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaCreditCard, FaTruck, FaSpinner, FaTrash, FaMoneyBill1Wave, FaClock, FaTable, FaStore, FaMotorcycle, FaMapPin } from "react-icons/fa6";
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
  const [selectedMeja, setSelectedMeja] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [availableMejas, setAvailableMejas] = useState([]);
  const [loadingMejas, setLoadingMejas] = useState(false);
  const snapScriptLoaded = useRef(false);
  const [orderMethod, setOrderMethod] = useState("dinein");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  
  const [userLocation, setUserLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [distance, setDistance] = useState(0);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const leafletLoaded = useRef(false);

  const router = useRouter();

  const UMKM_LOCATION = {
    lat: -7.322728176064783,
    lng:  110.48619758870001
  };

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

  // Load Leaflet sekali saja ketika komponen mount
  useEffect(() => {
    if (leafletLoaded.current) return;

    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.L) {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
          script.async = true;
          script.onload = () => {
            leafletLoaded.current = true;
            resolve();
          };
          script.onerror = () => {
            console.error('Failed to load Leaflet');
            resolve();
          };
          document.head.appendChild(script);
        });
      } else {
        leafletLoaded.current = true;
      }
    };

    loadLeaflet();
  }, []);

   useEffect(() => {
    if (orderMethod === "dinein" && availableMejas.length === 0) {
      fetchAvailableMejas();
    }
  }, [orderMethod]);

  // Initialize map ketika order method berubah ke delivery
  useEffect(() => {
    if (orderMethod === "delivery" && leafletLoaded.current && !mapInitialized) {
      initializeMap();
    }
  }, [orderMethod, mapInitialized]);

  const initializeMap = () => {
    if (!mapRef.current) {
      console.log('Map container not ready');
      return;
    }

    if (!window.L) {
      console.log('Leaflet not loaded yet');
      return;
    }

    setMapLoading(true);

    try {
      // Cleanup previous map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      mapInstanceRef.current = window.L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([UMKM_LOCATION.lat, UMKM_LOCATION.lng], 13);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);

      // Add UMKM marker
      window.L.marker([UMKM_LOCATION.lat, UMKM_LOCATION.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup('Lokasi UMKM Kami')
        .openPopup();

      // Add click event
      mapInstanceRef.current.on('click', handleMapClick);

      // Force resize after a delay
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

      setMapInitialized(true);
      setMapLoading(false);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapLoading(false);
    }
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setUserLocation({ lat, lng });
    
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }
    
    markerRef.current = window.L.marker([lat, lng])
      .addTo(mapInstanceRef.current)
      .bindPopup('Lokasi Pengiriman')
      .openPopup();

    const calculatedDistance = calculateDistance(lat, lng);
    setDistance(calculatedDistance);
    
    await getAddressFromCoordinates(lat, lng);
  };

  const calculateDistance = (lat, lng) => {
    const R = 6371;
    const dLat = (lat - UMKM_LOCATION.lat) * Math.PI / 180;
    const dLng = (lng - UMKM_LOCATION.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(UMKM_LOCATION.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      setSelectedAddress("Mengambil alamat...");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Gagal mengambil alamat');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        setSelectedAddress(data.display_name);
      } else {
        setSelectedAddress("Alamat tidak ditemukan");
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setSelectedAddress("Gagal mengambil alamat");
    }
  };

  const calculateDeliveryCost = () => {
    const COST_PER_KM = 5000;
    const baseCost = 10000;
    
    if (distance <= 0) return 0;
    
    let deliveryCost = baseCost + (distance * COST_PER_KM);
    
  
    
    return Math.round(deliveryCost);
  };

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

    if (orderMethod === "delivery") {
      if (!userLocation) {
        alert("Mohon pilih lokasi pengiriman pada peta");
        return false;
      }
      if (!selectedAddress || selectedAddress === "Silakan pilih lokasi pada peta") {
        alert("Mohon tunggu hingga alamat selesai dimuat");
        return false;
      }
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

    if (orderMethod === "delivery") {
      orderData.shipping_address = selectedAddress;
      orderData.shipping_cost = shipping;
    } else if (orderMethod === "dinein") {
      orderData.meja_id = parseInt(selectedMeja);
    } else if (orderMethod === "takeaway") {
      orderData.pickup_time = pickupTime;
    }

    const result = await checkout(orderData);
    
    if (result.success) {
      if (paymentMethod === "midtrans") {
        const snapToken = result.data.data.snap_token;
        if (!snapToken) throw new Error("Snap token tidak ditemukan");

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
            router.push(`/order-detail/${result.order_id}`);
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
    setSelectedMeja("");
    setPickupTime("");
    setUserLocation(null);
    setSelectedAddress("");
    setDistance(0);
    setMapInitialized(false);
    router.push(`/order-detail/${orderId}`);
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
  
  const shipping = orderMethod === "delivery" ? calculateDeliveryCost() : 0;
  const total = subtotal + shipping;

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

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
    <label className="block mb-2 font-medium flex items-center gap-2">
      <FaTable className="text-[#E67E22]" />
      Pilih Meja *
    </label>
    {loadingMejas ? (
      <div className="flex items-center gap-2 text-gray-500">
        <FaSpinner className="animate-spin" />
        <p>Memuat meja tersedia...</p>
      </div>
    ) : availableMejas.length > 0 ? (
      <div>
        <select 
          value={selectedMeja} 
          onChange={(e) => setSelectedMeja(e.target.value)} 
          className="w-full border rounded-md p-3 focus:outline-[#E67E22] bg-white" 
          required
        >
          <option value="">Pilih Meja</option>
          {availableMejas.map((meja) => (
            <option key={meja.id} value={meja.id}>
              Meja {meja.table_number} - Kapasitas: {meja.capacity} orang
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          {availableMejas.length} meja tersedia
        </p>
      </div>
    ) : (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2">Tidak ada meja tersedia saat ini</p>
        <p className="text-sm text-gray-500">
          Silakan pilih metode pemesanan lain atau coba lagi nanti
        </p>
      </div>
    )}
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
                  <label className="block mb-2 font-medium flex items-center gap-2">
                    <FaMapPin className="text-[#E67E22]" />
                    Pilih Lokasi Pengiriman *
                  </label>
                  
                  {mapLoading ? (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaSpinner className="animate-spin" />
                        <p>Memuat peta...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative z-0"> {/* z-0 untuk memastikan map di bawah konten lain */}
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-gray-300 mb-3 bg-gray-100 relative z-0"
          style={{ 
            minHeight: '256px',
            // Force isolate stacking context
            isolation: 'isolate'
          }}
        />
      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-blue-800">
                          <strong>Petunjuk:</strong> Klik pada peta untuk memilih lokasi pengiriman Anda
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Jarak Tempuh</p>
                          <p className="text-lg font-bold text-[#E67E22]">
                            {distance > 0 ? `${distance} km` : '-'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Biaya Pengiriman</p>
                          <p className="text-lg font-bold text-[#E67E22]">
                            {shipping > 0 ? formatPrice(shipping) : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Alamat Terpilih</p>
                        <p className="text-gray-900 mt-1 text-sm">
                          {selectedAddress || "Silakan pilih lokasi pada peta"}
                        </p>
                      </div>
                    </>
                  )}
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
                <div className="flex justify-between mb-2">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {orderMethod === "delivery" && (
                  <div className="flex justify-between mb-2">
                    <span>Biaya Pengiriman</span>
                    <span>
                      {shipping > 0 ? formatPrice(shipping) : '-'}
                      {distance > 0 && (
                        <span className="text-xs text-gray-500 block text-right">
                          ({distance} km × Rp 5.000)
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                <hr className="my-3 text-[#000000]/20" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={
                    checkoutLoading || 
                    (orderMethod === "delivery" && (!userLocation || !selectedAddress)) || 
                    (orderMethod === "dinein" && !selectedMeja) || 
                    (orderMethod === "takeaway" && !pickupTime) || 
                    cart.some(item => getAvailableStock(item) === 0)
                  } 
                  className="w-full mt-5 bg-[#E67E22] text-white py-3 rounded-lg hover:bg-[#cf6d13] disabled:opacity-50 transition flex items-center justify-center"
                >
                  {checkoutLoading ? (
                    <><FaSpinner className="animate-spin mr-2" />Memproses Pembayaran...</>
                  ) : (
                    <><FaCreditCard className="inline mr-2" />Lanjut Ke Pembayaran</>
                  )}
                </button>

                <Link href="/menu" className="block w-full mt-3 bg-transparent text-[#E2A22A] hover:text-white border-[#E2A22A] border-2 py-3 rounded-lg hover:bg-[#cf6d13] transition text-center">
                  Kembali Belanja
                </Link>
                
                {orderMethod === "delivery" && (
                  <div className="flex flex-col mt-4 bg-[#FFF4E5] text-[#E67E22] rounded-lg p-4 gap-1 text-sm">
                    <div className="flex items-center mb-1">
                      <FaTruck className="inline mr-2 text-lg" />
                      <p className="text-black font-semibold">Info Pengiriman</p>
                    </div>
                    <div>
                      <p className="text-[#8B4513]">
                        Biaya pengiriman dihitung berdasarkan jarak (Rp 5.000 per km) + biaya dasar Rp 10.000
                      </p>
                    </div>
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