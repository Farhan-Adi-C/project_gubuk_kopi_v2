"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditTableForm({ tableData }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [formData, setFormData] = useState({
    table_number: "",
    capacity: 4,
    status: "available",
  });

  const [errors, setErrors] = useState({});

  // Set form data from props
  useEffect(() => {
    if (tableData && !isDataLoaded) {
      setFormData({
        table_number: tableData.table_number || "",
        capacity: tableData.capacity || 4,
        status: tableData.status || "available",
      });
      setIsDataLoaded(true);
    }
  }, [tableData, isDataLoaded]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.table_number.trim()) {
      newErrors.table_number = "Nomor meja wajib diisi";
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Kapasitas harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/mejas/${tableData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: formData.table_number,
          capacity: formData.capacity,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/mejas");
      }
    } catch (error) {
      console.error("Error updating table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isDataLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="size-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data meja...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* Nomor Meja */}
          <div className="space-y-2">
            <Label htmlFor="table_number" className="text-sm font-medium">
              Nomor Meja <span className="text-red-500">*</span>
            </Label>
            <Input
              id="table_number"
              type="text"
              placeholder="Masukkan nomor meja (contoh: T001, A01, etc.)"
              value={formData.table_number}
              onChange={(e) => handleInputChange("table_number", e.target.value)}
              disabled={isLoading}
              className={errors.table_number ? "border-red-500" : ""}
            />
            {errors.table_number && (
              <p className="text-sm text-red-500">{errors.table_number}</p>
            )}
          </div>

          {/* Kapasitas */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm font-medium">
              Kapasitas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="20"
              placeholder="Masukkan kapasitas meja"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className={errors.capacity ? "border-red-500" : ""}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Jumlah orang yang dapat ditampung oleh meja
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue>
                  {formData.status === "available" ? "Tersedia" : "Dipesan"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    <span>Tersedia</span>
                  </div>
                </SelectItem>
                <SelectItem value="reserved">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-yellow-500"></div>
                    <span>Dipesan</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Status ketersediaan meja
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Link href="/admin/tables">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
            >
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? (
              <>
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              "Update Meja"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}