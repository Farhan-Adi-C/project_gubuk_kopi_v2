"use client"
import React from "react"
import { AlertCircleIcon, CheckCircle2Icon, XIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertDemo({ message, type = "success", onClose }) {
  return (
    <div className="animate-in slide-in-from-right-80 duration-300 w-full max-w-md">
    <Alert
  className={`
    shadow-lg border-l-4 relative flex items-center gap-3
    ${type === "success" 
      ? "border-green-500 bg-green-50" 
      : "border-red-500 bg-red-50"
    }
    min-h-[80px] w-full
  `}
>
  {/* Icon */}
  <div className="flex-shrink-0">
    {type === "success" ? 
      <CheckCircle2Icon className="h-5 w-5 text-green-600" /> : 
      <AlertCircleIcon className="h-5 w-5 text-red-600" />
    }
  </div>

  {/* Teks */}
  <div className="flex-1 min-w-0">
    <AlertTitle className={`
      text-sm font-semibold
      ${type === "success" ? "text-green-800" : "text-red-800"}
    `}>
      {type === "success" ? "Success" : "Error"}
    </AlertTitle>
    <AlertDescription >
      <p className={`text-sm ${type === "success" ? "text-green-700" : "text-red-700"} break-words`}>
        {message}
      </p>
    </AlertDescription>
  </div>

  {/* Tombol close */}
  {onClose && (
    <button
      onClick={onClose}
      className={`
        flex-shrink-0 ml-2 rounded-full p-1 hover:bg-opacity-20 transition-colors
        ${type === "success" 
          ? "text-green-600 hover:bg-green-200" 
          : "text-red-600 hover:bg-red-200"
        }
      `}
    >
      <XIcon className="h-4 w-4" />
    </button>
  )}
</Alert>

    </div>
  )
}