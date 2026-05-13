"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CreateReservationSchema, CreateReservationInput } from "@/schemas/reservation.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Warehouse = {
  id: string;
  name: string;
  available: number;
};

export function ReserveDialog({
  productId,
  warehouses,
  onReserved,
}: {
  productId: string;
  warehouses: Warehouse[];
  onReserved: (productId: string, warehouseId: string, quantity: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReservationInput>({
    resolver: zodResolver(CreateReservationSchema),
    defaultValues: {
      productId,
      warehouseId: warehouses[0]?.id ?? "",
      quantity: 1,
    },
  });

  async function onSubmit(data: CreateReservationInput) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (res.status === 409) {
      toast.error("Not enough stock at this warehouse");
      return;
    }

    if (!res.ok) {
      toast.error(json.message || "Something went wrong");
      return;
    }

    onReserved(data.productId, data.warehouseId, data.quantity);
    setOpen(false);
    reset();
    router.push(`/reservations/${json.data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Reserve</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve Stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("productId")} />

          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse</Label>
            <select
              id="warehouseId"
              {...register("warehouseId")}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.available} available)
                </option>
              ))}
            </select>
            {errors.warehouseId && (
              <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Reserving..." : "Confirm Reserve"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
