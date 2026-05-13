import { NextResponse } from "next/server";

import * as warehouseService from "@/services/warehouse.services";

export async function getwarehouses() {
    try{
        const warehouses = await warehouseService.getAllWarehouses();

        return NextResponse.json(
            {
                success: true,
                data: warehouses
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error fetching warehouses"
            },
            {
                status: 500
            }
        );
    }
}