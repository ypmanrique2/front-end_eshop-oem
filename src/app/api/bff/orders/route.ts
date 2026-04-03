import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * BFF Route: /api/bff/orders
 * Proxies requests to Spring Boot backend while handling CORS and errors
 * 
 * IMPORTANTE: Usa auth() de NextAuth para obtener el token en el servidor
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

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
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Error al obtener pedidos" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await fetch(`${backendUrl}/orders`, {
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
        { error: errorText || "Error al crear pedido" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al crear pedido" },
      { status: 500 }
    );
  }
}