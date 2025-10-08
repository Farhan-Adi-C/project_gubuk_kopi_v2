'use client';
import { useState } from 'react';
import { FiClock, FiCoffee, FiShoppingCart } from 'react-icons/fi';

export default function MenuDetail({ params }) {
  const menuData = {
    id: 1,
    title: "Caramel Macchiato",
    description: "Perpaduan espresso berkualitas dengan susu steamed, vanilla syrup, dan caramel sauce. Disajikan dengan foam lembut.",
    price: 35000,
    discount: 15,
    image: "/menu.jpg",
    variants: [
      { id: 1, name: "Hot", price: 0 },
      { id: 2, name: "Iced", price: 1000 },
    ],
    category: "Coffee",
    preparationTime: "5-7 menit",
    caffeineLevel: "Medium"
  };

  const [selectedVariant, setSelectedVariant] = useState(menuData.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const basePrice = menuData.price * quantity;
  const discountedPrice = menuData.discount > 0 ? basePrice * (1 - menuData.discount / 100) : basePrice;
  const finalPrice = discountedPrice + selectedVariant.price * quantity;

  const addToCart = () => {
    const cartItem = {
      menu: menuData,
      variant: selectedVariant,
      quantity,
      totalPrice: finalPrice
    };
    console.log('Added to cart:', cartItem);
    alert(`${menuData.title} (${selectedVariant.name}) berhasil ditambahkan ke keranjang!`);
  };

  return (
    <div className="min-h-screen py-36 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Gambar */}
        <div className="lg:w-1/2 relative rounded-3xl overflow-hidden">
          <img
            src={menuData.image}
            alt={menuData.title}
            className="w-full h-80 sm:h-96 object-cover rounded-3xl"
          />
          {menuData.discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
              {menuData.discount}% OFF
            </span>
          )}
          <span className="absolute top-4 right-4 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {menuData.category}
          </span>
        </div>

        {/* Info Menu */}
        <div className="lg:w-1/2 flex flex-col justify-between bg-white rounded-3xl p-6 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{menuData.title}</h1>
            <p className="text-gray-600 mb-4">{menuData.description}</p>

            {/* Harga */}
            <div className="flex items-center gap-3 mb-6">
              {menuData.discount > 0 && (
                <span className="line-through text-gray-400 text-lg">
                  Rp {basePrice.toLocaleString('id-ID')}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-bold text-amber-600">
                Rp {finalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Variants */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Varian</h3>
              <div className="flex flex-wrap gap-3">
                {menuData.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      selectedVariant.id === v.id
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price > 0 && <span className="text-sm text-gray-400">+ Rp {v.price.toLocaleString('id-ID')}</span>}
                  </button>
                ))}
              </div>
            </div>

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
            <span><FiShoppingCart/></span>
            <span>Tambah ke Keranjang - Rp {finalPrice.toLocaleString('id-ID')}</span>
          </button>

          {/* Info Tambahan */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2"><span><FiClock/></span> Prep: {menuData.preparationTime}</div>
            <div className="flex items-center gap-2"><span><FiCoffee/></span> Caffeine: {menuData.caffeineLevel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
