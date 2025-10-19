'use client';
import React, { useEffect, useState } from 'react';
import { FiClock, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/get-token-user';

export default function MenuDetail({ params }) {
  const [menuData, setMenuData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { slug } = React.use(params);
  const router = useRouter();

  console.log("selectedVariant", selectedVariant);

  const API_URL = `http://127.0.0.1:8000/api/products/${slug}`;
  const CART_API_URL = 'http://localhost:8000/api/cart/add';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch product');
        const json = await res.json();
        const data = json.data;

        setMenuData(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const addToCart = async () => {
    setAddingToCart(true);
    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        alert('Silakan login terlebih dahulu!');
        router.push('/login');
        return;
      }

      // Validasi tambahan
      if (!menuData?.id) {
        alert('Data produk tidak valid');
        return;
      }

      // Validasi stok
      const availableStock = selectedVariant?.stock || menuData.stock;
      if (quantity > availableStock) {
        alert(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
        return;
      }

      const formData = new FormData();
      formData.append('product_id', menuData.id.toString());
      formData.append('quantity', quantity.toString());
      
      if (selectedVariant?.id) {
        formData.append('variant_id', selectedVariant.id.toString());
      }

      const response = await fetch(CART_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {

        
        const variantName = selectedVariant ? ` (${selectedVariant.name})` : '';
        alert(`${quantity} ${menuData.name}${variantName} berhasil ditambahkan ke keranjang!`);
        window.dispatchEvent(new Event("cartUpdated"));
        
        // Redirect ke menu (sesuai kode Anda)
        router.push('/menu');
      } else {
        console.error('Error adding to cart:', result);
        alert(result.message || 'Gagal menambahkan ke keranjang. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Produk tidak ditemukan.
      </div>
    );
  }

  const basePrice = menuData.price * quantity;
  const discountedPrice = menuData.discount > 0
    ? basePrice * (1 - menuData.discount / 100)
    : basePrice;
  const finalPrice = discountedPrice + ((selectedVariant?.additional_price || 0) * quantity);

  // Mendapatkan stok yang tersedia
  const getAvailableStock = () => {
    return selectedVariant?.stock || menuData.stock;
  };

  // Mendapatkan status stok
  const getStockStatus = () => {
    const stock = getAvailableStock();
    if (stock === 0) return { text: 'Stok Habis', color: 'text-red-500' };
    if (stock <= 5) return { text: `Stok Tersisa: ${stock}`, color: 'text-orange-500' };
    return { text: `Stok: ${stock}`, color: 'text-green-500' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen py-36 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Gambar */}
        <div className="lg:w-1/2 relative rounded-3xl overflow-hidden">
          <img
            src={`http://127.0.0.1:8000/storage/${menuData.image}`}
            alt={menuData.name}
            className="w-full h-80 sm:h-96 object-cover rounded-3xl"
          />
          {menuData.discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
              {menuData.discount}% OFF
            </span>
          )}
          <span className="absolute top-4 right-4 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {menuData.category?.name}
          </span>
        </div>

        {/* Info Menu */}
        <div className="lg:w-1/2 flex flex-col justify-between bg-white rounded-3xl p-6 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {menuData.name}
            </h1>
            <p className="text-gray-600 mb-4">{menuData.description}</p>

            {/* Harga */}
            <div className="flex items-center gap-3 mb-6">
              {menuData.discount > 0 && (
                <span className="line-through text-gray-400 text-lg">
                  Rp {basePrice.toLocaleString('id-ID')}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-bold text-amber-600">
                Rp {discountedPrice.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Variants */}
            {menuData.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Varian
                </h3>
                <div className="flex flex-wrap gap-3">
                  {menuData.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                      } ${v.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={addingToCart || v.stock === 0}
                    >
                      <div className="flex items-center gap-2">
                        <span>{v.name}</span>
                        {v.additional_price > 0 && (
                          <span className="text-sm text-gray-400">
                            + Rp {v.additional_price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                      {v.stock !== undefined && (
                        <span className={`text-xs ${v.stock === 0 ? 'text-red-500' : v.stock <= 5 ? 'text-orange-500' : 'text-green-500'}`}>
                          Stok: {v.stock}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-gray-900">Jumlah:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50"
                  disabled={addingToCart || quantity <= 1 || getAvailableStock() === 0}
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50"
                  disabled={addingToCart || quantity >= getAvailableStock()}
                >
                  +
                </button>
              </div>
              <span className={`text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={addToCart}
            disabled={addingToCart || getAvailableStock() === 0}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:bg-gray-400 text-white py-3 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menambahkan...</span>
              </>
            ) : getAvailableStock() === 0 ? (
              <>
                <FiPackage />
                <span>Stok Habis</span>
              </>
            ) : (
              <>
                <FiShoppingCart />
                <span>
                  Tambah ke Keranjang - Rp {finalPrice.toLocaleString('id-ID')}
                </span>
              </>
            )}
          </button>

          {/* Info Tambahan */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FiClock /> Prep: 5-7 menit
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}