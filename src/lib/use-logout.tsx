"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * useLogout Hook - Manejo robusto de logout con Keycloak
 * 
 * FAANG'26: Maneja errores de Keycloak gracefully y redirige a /login
 * El id_token_hint es necesario para que Keycloak cierre la sesión correctamente
 */
export function useLogout() {
  const { data: session } = useSession();
  const router = useRouter();

  const logout = useCallback(async () => {
    const keycloakIssuer = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER || 
      "http://localhost:8081/realms/yadin-market";

    // 1. Primero cerrar sesión en NextAuth (limpia cookies locales)
    await signOut({ 
      callbackUrl: "/login", 
      redirect: false 
    });

    // 2. Intentar logout en Keycloak con id_token_hint
    // El id_token está disponible en session.idToken
    const idToken = (session as any)?.idToken;
    
    if (idToken) {
      try {
        // URL de logout de Keycloak con id_token_hint
        const keycloakLogoutUrl = new URL(`${keycloakIssuer}/protocol/openid-connect/logout`);
        keycloakLogoutUrl.searchParams.set("post_logout_redirect_uri", window.location.origin + "/login");
        keycloakLogoutUrl.searchParams.set("id_token_hint", idToken);
        
        // Redirigir a Keycloak logout
        window.location.href = keycloakLogoutUrl.toString();
        return;
      } catch (error) {
        console.warn("Keycloak logout with id_token failed, trying without it:", error);
      }
    }

    // 3. Fallback: Si no hay idToken o falló, intentar sin id_token_hint
    try {
      const fallbackLogoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin + "/login")}`;
      window.location.href = fallbackLogoutUrl;
    } catch (error) {
      // 4. Último recurso:直接将 a /login local
      console.warn("Keycloak logout failed completely, redirecting to local /login:", error);
      router.push("/login");
    }
  }, [session, router]);

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