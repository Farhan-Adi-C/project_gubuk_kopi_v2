'use client';
import React, { useEffect, useState } from 'react';
import { FiClock, FiCoffee, FiShoppingCart } from 'react-icons/fi';

export default function MenuDetail({ params }) {
  const [menuData, setMenuData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { slug } = React.use(params);

  console.log("selectedVariant", selectedVariant);

  // Ganti URL API sesuai backend kamu
  const API_URL = `http://127.0.0.1:8000/api/products/${slug}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        const data = json.data;

        setMenuData(data);
        // if (data.variants && data.variants.length > 0) {
        //   setSelectedVariant(data.variants[0]);
        // }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

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
  const discountedPrice =
    menuData.discount > 0
      ? basePrice * (1 - menuData.discount / 100)
      : basePrice;
  const finalPrice =
  discountedPrice + ((selectedVariant?.additional_price || 0) * quantity);

  const addToCart = () => {
    const cartItem = {
      menu: menuData,
      variant: selectedVariant,
      quantity,
      totalPrice: finalPrice,
    };
    console.log('Added to cart:', cartItem);
    alert(`${menuData.name} (${selectedVariant?.name}) berhasil ditambahkan ke keranjang!`);
  };

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
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.additional_price > 0 && (
                        <span className="text-sm text-gray-400">
                          + Rp {v.additional_price.toLocaleString('id-ID')}
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
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={addToCart}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <FiShoppingCart />
            <span>
              Tambah ke Keranjang - Rp {finalPrice.toLocaleString('id-ID')}
            </span>
          </button>

          {/* Info Tambahan */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FiClock /> Prep: 5-7 menit
            </div>
            <div className="flex items-center gap-2">
              <FiCoffee /> Caffeine: Medium
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
