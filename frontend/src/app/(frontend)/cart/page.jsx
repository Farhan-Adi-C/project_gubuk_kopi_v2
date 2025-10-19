"use client";
import { getAuthToken } from "@/lib/get-token-user";
import { Bitter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaCreditCard, FaTruck, FaSpinner, FaPlus, FaMinus, FaTrash } from "react-icons/fa6";
import { TbShoppingCartX } from "react-icons/tb";
import { useRouter } from "next/navigation";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-bitter",
});

// API function untuk get cart
async function getCart() {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("User belum login. Token tidak ditemukan.");
    }

    const res = await fetch("http://localhost:8000/api/cart", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("Response data:", data);

    if (!res.ok) {
      throw new Error(data.message || `Gagal mengambil cart (${res.status})`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get cart error:", error);
    return { success: false, error: error.message };
  }
}

// API function untuk update quantity
async function updateCartQuantity(cartId, quantity) {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("User belum login. Token tidak ditemukan.");
    }

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

    if (!res.ok) {
      throw new Error(data.message || `Gagal update quantity (${res.status})`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Update quantity error:", error);
    return { success: false, error: error.message };
  }
}

// API function untuk delete item cart
async function removeFromCart(cartId) {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("User belum login. Token tidak ditemukan.");
    }

    const res = await fetch(`http://localhost:8000/api/cart/remove/${cartId}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Gagal menghapus item (${res.status})`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Remove cart error:", error);
    return { success: false, error: error.message };
  }
}

// API function untuk checkout
async function checkout(shippingAddress) {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("User belum login. Token tidak ditemukan.");
    }

    const res = await fetch("http://localhost:8000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: shippingAddress
      }),
    });

    const data = await res.json();
    console.log("Checkout response:", data);

    if (!res.ok) {
      throw new Error(data.message || `Gagal checkout (${res.status})`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Checkout error:", error);
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
  const snapScriptLoaded = useRef(false);

   const router = useRouter();


  // Load Midtrans Snap script
  useEffect(() => {
    if (!snapScriptLoaded.current) {
      const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

      // Check if script already exists
      if (!document.querySelector(`script[src="${snapScript}"]`)) {
        const script = document.createElement('script');
        script.src = snapScript;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        
        script.onload = () => {
          console.log('Midtrans Snap script loaded successfully');
          snapScriptLoaded.current = true;
        };
        
        script.onerror = () => {
          console.error('Failed to load Midtrans Snap script');
        };

        document.body.appendChild(script);
      } else {
        snapScriptLoaded.current = true;
      }
    }

    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching cart data...");
      
      const result = await getCart();
      console.log("API Result:", result);
      
      if (result.success) {
        const cartItems = result.data?.data?.items || [];
        console.log("Cart items:", cartItems);
        setCart(cartItems);
      } else {
        setError(result.error || "Gagal memuat keranjang");
      }
    } catch (err) {
      setError("Gagal memuat data keranjang");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan stok yang tersedia
  const getAvailableStock = (item) => {
    // Jika ada variant, gunakan stok variant, jika tidak gunakan stok produk
    return item.variant?.stock !== undefined ? item.variant.stock : item.product?.stock || 0;
  };

  // Handle quantity increase dengan validasi stok
  const handleIncreaseQuantity = async (cartId, currentQuantity, item) => {
    const availableStock = getAvailableStock(item);
    
    if (currentQuantity >= availableStock) {
      alert(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      return;
    }

    const newQuantity = currentQuantity + 1;
    await updateQuantity(cartId, newQuantity, item);
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = async (cartId, currentQuantity, item) => {
    if (currentQuantity <= 1) return;
    const newQuantity = currentQuantity - 1;
    await updateQuantity(cartId, newQuantity, item);
  };

  // Update quantity function dengan pengecekan stok
  const updateQuantity = async (cartId, newQuantity, item) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      
      const availableStock = getAvailableStock(item);
      
      // Validasi stok sebelum update
      if (newQuantity > availableStock) {
        throw new Error(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      }

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
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(`Gagal update quantity: ${error.message}`);
      
      // Jika stok = 0, hapus item dari cart
      if (error.message.includes('Stok tidak mencukupi') && getAvailableStock(item) === 0) {
        await handleAutoRemoveItem(cartId, item);
      } else {
        fetchCartData(); // Refresh data cart
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  // Handle auto remove item ketika stok = 0
  const handleAutoRemoveItem = async (cartId, item) => {
    try {
      console.log(`Auto removing item ${cartId} karena stok habis`);
      
      const result = await removeFromCart(cartId);
      
      if (result.success) {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== cartId));
        alert(`Produk ${item.product?.name} dihapus dari keranjang karena stok habis`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error auto removing item:", error);
      // Tetap hapus dari state UI meskipun API gagal
      setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== cartId));
    }
  };

  // Handle delete item
  const handleDeleteItem = async (cartId, itemName = "item ini") => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${itemName} dari keranjang?`)) {
      return;
    }

    try {
      setDeletingItems(prev => new Set(prev).add(cartId));
      
      const result = await removeFromCart(cartId);
      
      if (result.success) {
        setCart(prevCart => prevCart.filter(item => item.id !== cartId));
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(`Gagal menghapus item: ${error.message}`);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  // Check untuk items dengan stok = 0 saat component mount
  useEffect(() => {
    if (cart.length > 0) {
      const checkStockForAllItems = async () => {
        const outOfStockItems = cart.filter(item => getAvailableStock(item) === 0);
        
        for (const item of outOfStockItems) {
          await handleAutoRemoveItem(item.id, item);
        }
      };

      checkStockForAllItems();
    }
  }, [cart]);

  // Handle checkout dengan Midtrans Snap
  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      alert("Mohon masukkan alamat pengiriman");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang belanja kosong");
      return;
    }

    // Validasi stok semua item sebelum checkout
    const itemsWithInsufficientStock = cart.filter(item => {
      const availableStock = getAvailableStock(item);
      return item.quantity > availableStock;
    });

    if (itemsWithInsufficientStock.length > 0) {
      const itemNames = itemsWithInsufficientStock.map(item => 
        `${item.product?.name} (Stok: ${getAvailableStock(item)})`
      ).join(', ');
      
      alert(`Stok tidak mencukupi untuk produk berikut: ${itemNames}. Silakan update quantity atau hapus item tersebut.`);
      return;
    }

    // Pastikan Snap script sudah loaded
    if (!window.snap) {
      alert("Sistem pembayaran sedang loading, silakan tunggu sebentar dan coba lagi");
      return;
    }

    try {
      setCheckoutLoading(true);
      
      console.log("Memproses checkout...");
      const result = await checkout(shippingAddress);
      console.log(result.data.success)
      
      if (result.data.success) {
        const snapToken = result.data.data.snap_token;
        console.log("Snap Token received:", snapToken);
        
        if (!snapToken) {
          throw new Error("Snap token tidak ditemukan dalam response");
        }

        // Panggil Midtrans Snap
        window.snap.pay(snapToken, {
          onSuccess: function(result) {
            alert("Pembayaran berhasil! Pesanan Anda sedang diproses.");
            // Clear cart setelah pembayaran berhasil
            setCart([]);
            window.dispatchEvent(new Event("cartUpdated"));
            setShippingAddress("");
            router.push(`/orderConfirmation/${result.order_id}`);
          },
          onPending: function(result) {
            console.log("Payment pending:", result);
            alert("Pembayaran pending. Silakan selesaikan pembayaran Anda.");
          },
          onError: function(result) {
            console.log("Payment error:", result);
            alert("Terjadi kesalahan saat proses pembayaran. Silakan coba lagi.");
          },
          onClose: function() {
            console.log("Payment popup closed without completing payment");
            // Tidak perlu alert di sini, biarkan user menutup sendiri
          }
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Gagal checkout: ${error.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Format price untuk display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate price per item setelah diskon dan variant
  const calculatePricePerItem = (item) => {
    if (!item.product) return 0;
    
    // Hitung harga setelah diskon
    const discountAmount = item.product.price * (item.product.discount / 100);
    const priceAfterDiscount = item.product.price - discountAmount;
    
    // Tambah harga variant
    const variantPrice = item.variant?.additional_price || 0;
    const finalPricePerItem = priceAfterDiscount + variantPrice;
    
    return finalPricePerItem;
  };

  // Hitung subtotal berdasarkan quantity dan harga per item
  const subtotal = cart.reduce((acc, item) => {
    const pricePerItem = calculatePricePerItem(item);
    return acc + (pricePerItem * item.quantity);
  }, 0);

  // Hitung shipping
  let shipping = 10000;
  let total = subtotal + shipping;

  if (subtotal >= 100000) {
    shipping = 0;
    total = subtotal;
  }

  // Total items in cart (sum of all quantities)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-full bg-[#F7F3F0] min-h-screen">
        <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
          <h2 className={`${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>
            Keranjang Belanja
          </h2>
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

  // Error state
  if (error) {
    return (
      <div className="max-w-full bg-[#F7F3F0] min-h-screen">
        <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
          <h2 className={`${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>
            Keranjang Belanja
          </h2>
        </div>
        <div className="max-w-4xl lg:max-w-full lg:px-20 mx-auto p-5 flex flex-col items-center justify-center min-h-60 gap-4">
          <p className="text-red-500 text-center">{error}</p>
          <div className="flex gap-2">
            <button 
              onClick={fetchCartData}
              className="bg-[#E67E22] text-white px-4 py-2 rounded-lg hover:bg-[#cf6d13] transition"
            >
              Coba Lagi
            </button>
            <Link
              href="/menu"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full bg-[#F7F3F0] min-h-screen">
      {/* Header */}
      <div className="text-center bg-white pt-28 lg:pt-32 pb-8 border-b-4 border-gray-300 px-5">
        <h2 className={`${bitter.className} text-2xl md:text-3xl font-bold text-[#E67E22] mb-2`}>
          Keranjang Belanja
        </h2>
        <p className="text-gray-600">
          Periksa kembali item sebelum lanjut ke pembayaran.
        </p>
      </div>

      <div className="max-w-4xl lg:max-w-full lg:px-20 mx-auto p-5 flex flex-col lg:flex-row gap-8">
        {cart.length === 0 ? (
          // Empty Cart
          <div className="flex flex-col items-center justify-center w-full py-20 gap-4">
            <TbShoppingCartX className="text-6xl text-gray-400" />
            <p className="text-gray-500 text-lg text-center">
              Keranjang belanja Anda kosong. <br />
              Tambahkan item untuk melanjutkan.
            </p>
            <Link
              href="/menu"
              className="mt-4 bg-[#E67E22] text-white px-6 py-3 rounded-lg hover:bg-[#cf6d13] transition"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 lg:w-1/2">
              {cart.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                const isDeleting = deletingItems.has(item.id);
                const pricePerItem = calculatePricePerItem(item);
                const totalPricePerItem = pricePerItem * item.quantity;
                const availableStock = getAvailableStock(item);
                const isOutOfStock = availableStock === 0;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-lg shadow-lg p-3 gap-3 ${
                      isOutOfStock ? 'bg-red-50 border border-red-200' : 'bg-[#fdfdfd]'
                    }`}
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product?.image ? `http://localhost:8000/storage/${item.product.image}` : "/menu.jpg"}
                        alt={item.product?.name || "Product Image"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product?.name}
                        {isOutOfStock && (
                          <span className="ml-2 text-red-500 text-sm font-normal">
                            (Stok Habis)
                          </span>
                        )}
                      </h3>

                      {/* Harga asli dan diskon */}
                      {item.product?.discount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 line-through">
                            {formatPrice(item.product?.price)}
                          </span>
                          <span className="text-red-500 font-medium">
                            {item.product?.discount}% OFF
                          </span>
                        </div>
                      )}

                      {/* Tampilkan variant kalau ada */}
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          Varian:{" "}
                          <span className="font-medium text-gray-800">
                            {item.variant.name}
                          </span>
                          {item.variant.additional_price > 0 && (
                            <span className="text-gray-500">
                              {" "}
                              (+{formatPrice(item.variant.additional_price)})
                            </span>
                          )}
                         
                        </p>
                      )}

                   

                      {/* Harga per item */}
                      <p className="text-[#E67E22] font-medium">
                        {formatPrice(pricePerItem)}
                      </p>

                      {/* Total per item */}
                      <p className="text-gray-900 font-semibold">
                        Total: {formatPrice(totalPricePerItem)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center gap-3">
                      {!isOutOfStock ? (
                        <>
                          <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-gray-50">
                            <button
                              onClick={() => handleDecreaseQuantity(item.id, item.quantity, item)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              −
                            </button>
                            
                            <span className="font-medium min-w-8 text-center">
                              {isUpdating ? (
                                <FaSpinner className="animate-spin mx-auto" size={14} />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            
                            <button
                              onClick={() => handleIncreaseQuantity(item.id, item.quantity, item)}
                              disabled={isUpdating || item.quantity >= availableStock}
                              className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              +
                            </button>
                          </div>

                         
                        </>
                      ) : (
                        <p className="text-red-500 text-sm font-medium text-center">
                          Stok Habis
                        </p>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteItem(item.id, item.product?.name)}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
                      >
                        {isDeleting ? (
                          <FaSpinner className="animate-spin" size={12} />
                        ) : (
                          <FaTrash size={12} />
                        )}
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/2 flex flex-col gap-6">
              {/* Address */}
              <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                <label className="block mb-2 font-medium">
                  Alamat Pengiriman *
                </label>
                <textarea
                  placeholder="Contoh: Jl. Merdeka No. 123, Jakarta Pusat"
                  className="w-full border rounded-md p-3 focus:outline-[#E67E22]"
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">
                  * Wajib diisi untuk proses pengiriman
                </p>
              </div>

              {/* Summary */}
              <div className="bg-[#fdfdfd] rounded-lg shadow-lg p-4">
                <h3 className="font-bold mb-4">Ringkasan Pesanan</h3>
                <div className="flex justify-between mb-2">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Biaya Pengiriman</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">GRATIS</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <hr className="my-3 text-[#000000]/20" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {/* Checkout Buttons */}
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !shippingAddress.trim() || cart.some(item => getAvailableStock(item) === 0)}
                  className="w-full mt-5 bg-[#E67E22] text-white py-3 rounded-lg hover:bg-[#cf6d13] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  {checkoutLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="inline mr-2" />
                      Lanjut Ke Pembayaran
                    </>
                  )}
                </button>

                <Link
                  href="/menu"
                  className="block w-full mt-3 bg-transparent text-[#E2A22A] hover:text-white border-[#E2A22A] border-2 py-3 rounded-lg hover:bg-[#cf6d13] transition text-center"
                >
                  Kembali Belanja
                </Link>
                <div className="flex flex-col mt-4 bg-[#FFF4E5] text-[#E67E22] rounded-lg p-4 gap-1 text-sm">
                  <div className="flex items-center mb-1">
                    <FaTruck className="inline mr-2 text-lg" />
                    <p className="text-black font-semibold">Gratis ongkir </p>
                  </div>
                  <div>
                    <p className="text-[#8B4513]">
                      Dengan Minimal Pembelian Rp 100.000 dan maksimal 5KM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}