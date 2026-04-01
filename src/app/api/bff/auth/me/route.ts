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
    // Obtener la sesión actual de NextAuth
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Llamar al backend con el JWT de Keycloak
    // El backend validará el JWT y ejecutará KeycloakUserSyncService
    const response = await apiClient.get("/auth/me");
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Error al obtener información del usuario" },
      { status: error.response?.status || 500 }
    );
  }
}