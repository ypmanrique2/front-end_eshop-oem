import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/api-client";

/**
 * BFF Route: /api/bff/orders
 * Proxies requests to Spring Boot backend while handling CORS and errors
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientName = searchParams.get("clientName");
    const myOrders = searchParams.get("myOrders");
    
    let endpoint = "/orders";
    
    if (status) {
      endpoint = `/orders/status/${status}`;
    } else if (clientName) {
      endpoint = `/orders/client/${encodeURIComponent(clientName)}`;
    } else if (myOrders === "true") {
      endpoint = "/orders/client";
    }
    
    const response = await apiClient.get(endpoint);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || "Error al obtener pedidos" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/orders", body);
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || "Error al crear pedido" },
      { status: error.response?.status || 500 }
    );
  }
}