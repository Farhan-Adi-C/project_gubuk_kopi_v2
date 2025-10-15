"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FaSpinner } from "react-icons/fa";

export default function GoogleRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code"); 

    console.log(code);

    if (!code) {
      router.replace("/login");
      return;
    }

    const fetchToken = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/auth/callback?code=${code}`
        );
        const data = await res.json();

        console.log(data);

        if (data.success && data.access_token) {
          Cookies.set("token", data.access_token, { expires: 1, sameSite: "Lax" });
          router.replace("/"); 
        } else {
          router.replace("/login");
        }
      } catch (e) {
        console.error(e);
        router.replace("/login");
      }
    };

    fetchToken();
  }, []);

  return (
   <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <FaSpinner className="animate-spin text-4xl text-orange-500 mb-4" />
      <p className="text-gray-700 text-lg font-medium">
        Login sukses, sedang mengalihkan...
      </p>
    </div>
  );
}
