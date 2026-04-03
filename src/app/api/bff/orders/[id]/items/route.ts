import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * BFF Route: /api/bff/orders/[id]/items
 * Proxies POST requests to Spring Boot backend to add items to an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "ID de pedido inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await fetch(`${backendUrl}/orders/${orderId}/items`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al agregar item al pedido" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al agregar item al pedido" },
      { status: 500 }
    );
  }
}