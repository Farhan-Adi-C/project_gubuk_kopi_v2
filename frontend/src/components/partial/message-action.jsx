import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";

export function MessageActions({ row, formatDate }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon">
            <IconDotsVertical />
            <span className="sr-only">Buka menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Lihat Pesan
          </DropdownMenuItem>
          {/* item lain seperti Hapus bisa ditambah di sini */}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pesan dari {row.original.name}</DialogTitle>
            <DialogDescription>
              Dikirim pada {formatDate(row.original.created_at)}
            </DialogDescription>
          </DialogHeader>

          <div className="p-2 mt-2 border rounded-md bg-muted/40 text-sm text-gray-800 whitespace-pre-wrap">
            {row.original.message || "(Tidak ada isi pesan)"}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
