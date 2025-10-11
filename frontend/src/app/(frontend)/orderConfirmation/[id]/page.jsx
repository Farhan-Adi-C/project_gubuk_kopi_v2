export default function OrderConfirmation({ params }) {
  // SVG Icons sebagai komponen
  const CheckIcon = ({ className = "w-16 h-16" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const ShoppingBag = ({ className = "w-32 h-32" }) => (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="25"
        y="30"
        width="50"
        height="60"
        rx="5"
        fill="#E2A22A"
        stroke="#C88C20"
        strokeWidth="2"
      />
      <path
        d="M35 30C35 25 40 20 50 20C60 20 65 25 65 30"
        stroke="#C88C20"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="40" cy="45" r="2" fill="white" />
      <circle cx="60" cy="45" r="2" fill="white" />
    </svg>
  );

  const DocumentIcon = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );

  const CartIcon = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen py-32 bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header dengan ikon centang */}
        <div className="bg-[#E2A22A] py-8 px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <CheckIcon className="w-12 h-12 text-[#E2A22A]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Thank you for ordering!
          </h1>
        </div>

        {/* Konten utama */}
        <div className="p-6">
          {/* Ilustrasi shopping bag */}
          <div className="flex justify-center mb-6">
            <ShoppingBag />
          </div>

          {/* Teks utama */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4 text-lg">
              Makasih udah belanja di sini!
            </p>
            <p className="text-gray-700 text-lg">
              Pesanan kamu lagi kami siapin, tunggu konfirmasi berikutnya ya.
            </p>
          </div>

          {/* Info order tambahan */}
          <div className="bg-[#FFF6E5] rounded-lg p-4 mb-6 border border-[#F5D48B]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Order Number:</span>
              <span className="font-semibold text-[#C88C20]">#ORD-123456</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Order Date:</span>
              <span className="font-semibold">Dec 12, 2023</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Estimated Delivery:</span>
              <span className="font-semibold">2-3 Business Days</span>
            </div>
          </div>

          {/* Tombol-tombol aksi */}
          <div className="space-y-4">
            <button className="w-full bg-[#E2A22A] hover:bg-[#C88C20] text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
              <DocumentIcon />
              <span className="ml-2">VIEW ORDER</span>
            </button>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center border border-gray-300">
              <CartIcon />
              <span className="ml-2">CONTINUE SHOPPING</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
