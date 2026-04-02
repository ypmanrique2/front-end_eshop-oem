import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import apiClient from "@/lib/api-client";

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
    // IMPORTANTE: Pasar el token explícitamente porque en server-side no funciona el interceptor
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al obtener información del usuario" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener información del usuario" },
      { status: 500 }
    );
  }
}