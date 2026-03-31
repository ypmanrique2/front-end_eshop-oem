import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/api-client";

/**
 * BFF Route: /api/bff/products
 * Proxies requests to Spring Boot backend while handling CORS and errors
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const inStock = searchParams.get("inStock");
    const search = searchParams.get("search");
    
    let endpoint = "/products";
    
    if (category) {
      endpoint = `/products/category/${category}`;
    } else if (inStock === "true") {
      endpoint = "/products/in-stock";
    } else if (search) {
      endpoint = `/products/search?q=${encodeURIComponent(search)}`;
    }
    
    const response = await apiClient.get(endpoint);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || "Error al obtener productos" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/products", body);
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || "Error al crear producto" },
      { status: error.response?.status || 500 }
    );
  }
}