import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * BFF Route: /api/bff/auth/me
 * 
 * Este endpoint es CRUCIAL para la sincronización:
 * 1. Obtiene la sesión actual con el JWT de Keycloak
 * 2. Envía el JWT al backend Spring Boot
 * 3. Backend valida el JWT y sincroniza el usuario a PostgreSQL
 * 4. Retorna la info del usuario sincronizado
 * 
 * Este debe llamarse DESPUÉS del login para triggerar el KeycloakUserSyncService
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión actual de NextAuth (server-side)
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Llamar al backend con el JWT de Keycloak en el header
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    console.log(">>> BFF calling backend:", `${backendUrl}/auth/me`);
    
    const response = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    const responseText = await response.text();
    console.log(">>> BFF backend response status:", response.status);
    console.log(">>> BFF backend response body:", responseText);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al obtener información del usuario", details: responseText },
        { status: response.status }
      );
    }
    
    const data = JSON.parse(responseText);
    console.log(">>> BFF parsed data:", JSON.stringify(data));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(">>> BFF Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener información del usuario" },
      { status: 500 }
    );
  }
}