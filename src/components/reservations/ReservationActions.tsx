"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReservationActions({
  reservationId,
  status,
}: {
  reservationId: string;
  status: string;
}) {
  const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null);
  const router = useRouter();

  if (status !== "PENDING") {
    return (
      <p className="text-sm">
        Status: <span className="font-semibold">{status}</span>
      </p>
    );
  }

  async function handleConfirm() {
    setLoading("confirm");
    const res = await fetch(`/api/reservations/${reservationId}/confirm`, {
      method: "POST",
    });
    const json = await res.json();
    setLoading(null);

    if (res.status === 410) {
      toast.error("Reservation expired");
      router.refresh();
      return;
    }

    if (!res.ok) {
      toast.error(json.message || "Failed to confirm");
      return;
    }

    toast.success("Purchase confirmed!");
    router.refresh();
  }

  async function handleCancel() {
    setLoading("cancel");
    const res = await fetch(`/api/reservations/${reservationId}/release`, {
      method: "POST",
    });
    const json = await res.json();
    setLoading(null);

    if (!res.ok) {
      toast.error(json.message || "Failed to cancel");
      return;
    }

    toast.success("Reservation cancelled");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleConfirm} disabled={loading !== null}>
        {loading === "confirm" ? "Processing..." : "Confirm Purchase"}
      </Button>
      <Button variant="outline" onClick={handleCancel} disabled={loading !== null}>
        {loading === "cancel" ? "Processing..." : "Cancel"}
      </Button>
    </div>
  );
}
