"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * useLogout Hook - Manejo robusto de logout
 * 
 * FAANG'26: Siempre redirige al home "/" después de cerrar sesión
 * No depende de Keycloak para el logout local
 */
export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    // 1. PRIMERO: Cerrar sesión en NextAuth (limpia cookies locales)
    // redirect: false para tener control total del flujo
    await signOut({ 
      callbackUrl: "/", 
      redirect: false 
    });

    // 2. Intentar logout en Keycloak en background (no bloqueante)
    // Si falla, no importa - ya vamos a redirigir al home
    try {
      const keycloakIssuer = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER || 
        "http://localhost:8081/realms/yadin-market";
      
      // Intentar logout sin depender del resultado
      // Usar fetch para no bloquear la UI
      fetch(`${keycloakIssuer}/protocol/openid-connect/logout`, {
        method: 'GET',
        redirect: 'manual', // No seguir redirects automáticamente
      }).catch(() => {
        // Silenciar cualquier error - no nos importa
      });
    } catch (error) {
      // Silenciar errores - no afectan el flujo
      console.debug("Keycloak logout attempt:", error);
    }

    // 3. SIEMPRE redirigir al home (fallback seguro)
    // Esto se ejecuta sin importar si Keycloak falló
    router.push("/");
    
    // Force refresh para asegurar清洁
    setTimeout(() => {
      router.refresh();
    }, 100);
  }, [router]);

  return { logout };
}

/**
 * LogoutButton - Componente listo para usar
 */
export function LogoutButton({ className = "" }: { className?: string }) {
  const { logout } = useLogout();

  return (
    <button
      onClick={logout}
      className={className}
      title="Cerrar Sesión"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}