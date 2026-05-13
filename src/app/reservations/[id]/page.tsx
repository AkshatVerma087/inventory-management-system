import { notFound } from "next/navigation";
import * as reservationRepository from "@/repositories/reservation.repository";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/reservations/CountdownTimer";
import { ReservationActions } from "@/components/reservations/ReservationActions";

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await reservationRepository.findReservationById(id);

  if (!reservation) {
    notFound();
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Reservation Details</h1>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Product:</span>{" "}
              {reservation.product.name}
            </p>
            <p>
              <span className="text-muted-foreground">Warehouse:</span>{" "}
              {reservation.warehouse.name}
            </p>
            <p>
              <span className="text-muted-foreground">Quantity:</span>{" "}
              {reservation.quantity}
            </p>
            <p>
              <span className="text-muted-foreground">Expires in:</span>{" "}
              <CountdownTimer expiresAt={reservation.expiresAt.toISOString()} status={reservation.status} />
            </p>
          </div>

          <ReservationActions
            reservationId={reservation.id}
            status={reservation.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}
