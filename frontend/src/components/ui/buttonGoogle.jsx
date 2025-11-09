"use client";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function ButtonGoogle() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth");
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 transition relative"
      disabled={loading}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className={`w-5 h-5 ${loading ? "opacity-50" : ""}`}
      />
      <span className="font-medium text-gray-700">
        {loading ? "Memproses..." : "Login dengan Google"}
      </span>
    </button>
  );
}
