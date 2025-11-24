"use client";
import { getAuthToken } from "@/lib/get-token-user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

export default function OrderConfirmation({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirected, setRedirected] = useState(false);
  const router = useRouter();
  
  // Unwrap params menggunakan use()
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

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

  useEffect(() => {
    const fetchOrder = async () => {
      if (redirected || !orderId) return;

      const token = await getAuthToken();
      if (!token) {
        setRedirected(true);
        router.replace("/");
        return;
      }

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/order/history/${orderId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        // Check if response is ok
        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
          setRedirected(true);
          router.replace("/");
          return;
        }

        const data = await res.json();
        console.log("Order data received:", data);

        // PERBAIKAN: data.data adalah object langsung, bukan array
        if (!data.success || !data.data) {
          console.error("No order data found");
          setRedirected(true);
          router.replace("/");
          return;
        }

        const orderData = data.data;
        console.log("Order status:", orderData.payment_status);

        // Allow both "paid" and "pending" status for Midtrans payments
        // Juga allow untuk cash payment yang langsung paid
        if (orderData.payment_status !== "paid" && orderData.payment_status !== "pending") {
          console.error("Payment not completed:", orderData.payment_status);
          setRedirected(true);
          router.replace("/");
          return;
        }

        // If we get here, the order is valid
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
        setRedirected(true);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, redirected]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#E2A22A] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-[#E2A22A] py-8 px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <CheckIcon className="w-12 h-12 text-[#E2A22A]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {order.payment_status === "paid" 
              ? "Thank you for ordering!" 
              : "Order Received!"}
          </h1>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <ShoppingBag />
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4 text-lg">
              {order.payment_status === "paid" 
                ? "Makasih udah belanja di sini!"
                : "Pesanan kamu sudah diterima!"}
            </p>
            <p className="text-gray-700 text-lg">
              {order.payment_status === "paid"
                ? "Pesanan kamu lagi kami siapin, tunggu konfirmasi berikutnya ya."
                : "Silakan selesaikan pembayaran untuk memproses pesanan kamu."}
            </p>
          </div>

          <div className="bg-[#FFF6E5] rounded-lg p-4 mb-6 border border-[#F5D48B]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Order Number:</span>
              <span className="font-semibold text-[#C88C20]">#{order.order_id}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Order Date:</span>
              <span className="font-semibold">
                {new Date(order.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Status:</span>
              <span className={`font-semibold ${
                order.payment_status === "paid" ? "text-green-600" : "text-orange-600"
              }`}>
                {order.payment_status === "paid" ? "Paid" : "Pending Payment"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href={"/historyOrder"} 
              className="w-full bg-[#E2A22A] hover:bg-[#C88C20] text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <DocumentIcon />
              <span className="ml-2">VIEW ORDER</span>
            </Link>
            <Link 
              href={"/menu"} 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center border border-gray-300"
            >
              <CartIcon />
              <span className="ml-2">CONTINUE SHOPPING</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}