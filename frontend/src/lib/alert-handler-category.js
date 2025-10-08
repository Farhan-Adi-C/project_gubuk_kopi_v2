"use client"
import { AlertDemo } from "@/components/partial/alert-success"
import { useEffect, useState } from "react"

export function AlertHandlerCategory() {
  const [alert, setAlert] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Effect untuk load alert dari sessionStorage
  useEffect(() => {
    const alertData = sessionStorage.getItem("categoryAlert");
    if (alertData) {
      try {
        const parsedAlert = JSON.parse(alertData); 
        setAlert(parsedAlert);
        setIsVisible(true);
      } catch (err) {
        console.error("Failed to parse alert data:", err);
      }
      // HAPUS immediate dari sessionStorage
      sessionStorage.removeItem("categoryAlert");
    }
  }, []);

  // Effect untuk auto dismiss
  useEffect(() => {
    if (isVisible && alert) {
      const timer = setTimeout(() => {
        handleCloseAlert();
      }, 5000); // Auto dismiss setelah 5 detik
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, alert]); // Dependency pada isVisible dan alert

  const handleCloseAlert = () => {
    setIsVisible(false)
    setTimeout(() => {
      setAlert(null)
    }, 300)
  }

  if (!alert || !isVisible) return null

  return (
    <div className="animate-in slide-in-from-top duration-300">
      <AlertDemo
        message={alert.message} 
        type={alert.type} 
        onClose={handleCloseAlert}
      />
    </div>
  )
}