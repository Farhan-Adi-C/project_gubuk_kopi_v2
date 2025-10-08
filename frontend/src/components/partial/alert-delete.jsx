// components/partial/alert-delete-category.jsx
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
import { IconLoader } from "@tabler/icons-react"
import { OctagonAlert } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"

export default function DeleteAlert({ 
  categoryName, 
  onConfirm, 
  size = "default",
  className,
  trigger // <- tambahan prop untuk custom trigger
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button size={size} className={className}>
            Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          <AlertDialogTitle>
            <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <OctagonAlert className="h-7 w-7 text-destructive" />
            </div>
            Hapus {categoryName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] text-center">
            Tindakan ini tidak bisa dibatalkan. Kategori akan dihapus secara permanen dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 sm:justify-center">
          <AlertDialogCancel disabled={isLoading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={buttonVariants({ variant: "destructive", size })}
          >
            {isLoading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
