"use server";

import { cookies } from "next/headers";

// Fungsi universal untuk ambil token login dari cookies
export async function getAuthToken() {
  try {
    // Jika dijalankan di server (Server Component, Route Handler, Middleware, Server Action)
    const token = cookies().get("token")?.value;
    if (token) return token;

    // Jika dijalankan di client (Client Component)
    if (typeof window !== "undefined") {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      return cookieValue || null;
    }

    return null;
  } catch (error) {
    console.error("Gagal mengambil token:", error);
    return null;
  }
}
