/**
 * Auth Sync Hook
 * 
 * Este hook sincroniza automáticamente el usuario con el backend después del login.
 * Debe llamarse en las páginas que requieren datos del usuario.
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export interface SyncedUser {
  // Keycloak data
  sub: string;
  email?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  roles: string[];
  // DB data
  dbUserId?: string;
  dbRole?: string;
}

export function useAuthSync() {
  const { data: session, status } = useSession();
  const [syncedUser, setSyncedUser] = useState<SyncedUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * Sincronizar usuario con el backend
   * Esto trigger KeycloakUserSyncService en Spring Boot
   */
  const syncWithBackend = async () => {
    if (!session?.accessToken) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch("/api/bff/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error sincronizando con backend");
      }

      const data = await response.json();
      
      // La respuesta del backend tiene formato { success: true, data: {...} }
      if (data.success && data.data) {
        setSyncedUser(data.data);
        console.log("✅ Usuario sincronizado con backend:", data.data);
      } else {
        console.warn("⚠️ Respuesta inesperada del backend:", data);
      }
    } catch (error: any) {
      console.error("❌ Error sincronizando usuario:", error);
      setSyncError(error.message || "Error de sincronización");
    } finally {
      setIsSyncing(false);
    }
  };

  // Cuando cambia el status de la sesión, sincronizar
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      syncWithBackend();
    } else if (status === "unauthenticated") {
      setSyncedUser(null);
    }
  }, [status, session?.accessToken]);

  return {
    session,
    status,
    syncedUser,
    isSyncing,
    syncError,
    syncWithBackend,
    // Helper para verificar si es admin
    isAdmin: syncedUser?.dbRole === "admin" || 
             syncedUser?.roles?.includes("admin") ||
             syncedUser?.roles?.some((r: string) => r.includes("admin")),
  };
}