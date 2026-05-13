import * as reservationController from "@/controllers/reservation.controller";

import { NextRequest } from "next/server";


export async function POST(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    
    return reservationController.release(id);
}