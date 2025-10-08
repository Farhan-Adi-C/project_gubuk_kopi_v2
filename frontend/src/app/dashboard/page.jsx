"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [token, setToken] = useState("");

  useEffect(() => {
    // kode ini hanya jalan di client (browser)
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  return (
    <div className="py-28 min-h-screen">
      <p>Hai ini di dashboard</p>
      <p>Token mu: {token ? token : "Belum ada token"}</p>
    </div>
  );
}
