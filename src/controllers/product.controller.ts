import { NextRequest, NextResponse } from "next/server";

import * as productService from "@/services/product.services";
import { success } from "zod";

export async function getProducts() {
    try{
        const products = await productService.getAllProducts();

        return NextResponse.json(
            {
                success: true,
                data: products
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error fetching products"
            },
            {
                status: 500
            }
        );
    }
}

