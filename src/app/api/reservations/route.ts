import * as reservationController from '@/controllers/reservation.controller'
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    return reservationController.create(req);
}

