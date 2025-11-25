"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

export default function useOrderSocket() {
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("order_created", (order) => {

      // pakai SweetAlert
      Swal.fire({
        title: `Order Baru: #${order.order_id}`,
        toast: true,
        position: "top-end",
        icon: "success",
        showConfirmButton: false,
        timer: 11000,
      });
    });

    return () => socket.disconnect();
  }, []);
}
