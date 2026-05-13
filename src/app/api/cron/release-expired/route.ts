import {NextResponse, NextRequest} from "next/server";

import * as reservationService from "@/services/reservation.services";
import { success } from "zod";


export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");

        const expectedSecret = `Bearer ${process.env.CRON_SECRET}`

        if(authHeader != expectedSecret) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            )
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            {
                status: 500,
            }
        )   
    }
}