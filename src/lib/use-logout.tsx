"use client";

import { signOut } from "next-auth/react";
import { useCallback } from "react";

/**
 * useLogout Hook - Manejo robusto de logout
 * 
 * FAANG'26: Siempre redirige al home "/" después de cerrar sesión
 * No depende de Keycloak para el logout local
 */
export function useLogout() {
  const logout = useCallback(async () => {
    // 1. Cerrar sesión en NextAuth (limpia cookies locales)
    await signOut({ 
      callbackUrl: "/", 
      redirect: true // Usar redirect true de NextAuth para navegar
    });
    // No necesita más lógica - NextAuth maneja la redirección
  }, []);

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