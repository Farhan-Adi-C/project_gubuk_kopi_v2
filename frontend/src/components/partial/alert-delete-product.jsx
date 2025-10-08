"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { IconLoader } from "@tabler/icons-react"
import { OctagonAlert } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function DeleteProductAlert({ productName, onConfirm }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      // Hanya tutup dialog setelah onConfirm selesai berhasil
      setIsOpen(false)
    } catch (error) {
      console.error("Error in confirmation:", error)
      // Tetap biarkan dialog terbuka jika ada error
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open) => {
    // Mencegah dialog ditutup saat loading
    if (isLoading) {
      return
    }
    setIsOpen(open)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem 
          variant="destructive" 
          onSelect={(e) => e.preventDefault()}
        >
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          <AlertDialogTitle>
            <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <OctagonAlert className="h-7 w-7 text-destructive" />
            </div>
            Hapus {productName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] text-center">
            Tindakan ini tidak bisa dibatalkan. Produk akan dihapus secara permanen dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 sm:justify-center">
          <AlertDialogCancel disabled={isLoading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isLoading}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isLoading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              'Hapus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}