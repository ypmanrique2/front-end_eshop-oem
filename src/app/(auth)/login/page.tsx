"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Login Page - ARQUITECTURA FAANG'26
 * 
 * Solo Keycloak autentica. El frontend redirige a Keycloak OAuth2.
 * La sincronización con PostgreSQL ocurre automáticamente en /api/auth/me
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for error in URL and redirect back to login
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      // Clear the error from URL without refreshing
      router.replace("/login");
    }
  }, [searchParams, router]);

  // Si ya está logueado, redirigir automáticamente
  useEffect(() => {
    if (session) {
      router.push("/products");
      router.refresh();
    }
  }, [session, router]);

  // Mostrar loading mientras verifica sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si ya tiene sesión, no mostrar login
  if (session) {
    return null;
  }

  // ========== LOGIN HANDLERS ==========

  /**
   * Login con Keycloak OAuth2
   * 
   * Flujo FAANG'26:
   * 1. Redirige a Keycloak
   * 2. Keycloak autenticación (login o register si es nuevo)
   * 3. Keycloak retorna JWT
   * 4. Frontend obtiene sesión
   * 5. /api/auth/me sincroniza usuario a PostgreSQL
   */
  const handleOAuth2Login = async () => {
    setIsLoading(true);
    try {
      await signIn("keycloak", {
        callbackUrl: "/products",
        redirect: true,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión con Keycloak");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            eShop <span className="text-indigo-400">OEM</span>
          </h1>
          <p className="text-slate-400">Tu tienda online de confianza</p>
        </div>

        {/* LOGIN SECTION - SOLO KEYCLOAK OAuth2 */}
        <div className="space-y-6">
          <p className="text-slate-400 text-center text-sm">
            Autentícate con tu cuenta de Keycloak
          </p>

          {/* Login con Keycloak OAuth2 */}
          <button
            onClick={handleOAuth2Login}
            disabled={isLoading}
            className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Redirigiendo a Keycloak...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Iniciar Sesión con Keycloak</span>
              </>
            )}
          </button>

          {/* Info box */}
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">¿Primera vez?</p>
                <p>Si no tienes cuenta, haz clic en el botón de arriba. Keycloak te guiará para crear una nueva cuenta.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            ¿Necesitas ayuda?{" "}
            <a href="mailto:yadin_65@hotmail.com" className="text-indigo-400 hover:text-indigo-300">
              Contacta al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}