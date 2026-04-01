"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

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

  /**
   * OAuth2 Flow con Keycloak - FLUJO CORRECTO
   * 
   * Cuando se llama signIn('keycloak') SIN credenciales locales,
   * NextAuth redirige al Authorization Endpoint de Keycloak.
   * 
   * El flujo es:
   * 1. Click en botón → signIn('keycloak')
   * 2. NextAuth → redirect a Keycloak OAuth2
   * 3. Usuario se autentica en Keycloak
   * 4. Keycloak → redirect con code
   * 5. NextAuth exchange code → access_token
   * 6. Sesión establecida con JWT de Keycloak
   */
  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    try {
      // signIn SIN credenciales = OAuth2/Authorization Code Flow
      // Esto redirige directamente a Keycloak
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            eShop <span className="text-indigo-400">OEM</span>
          </h1>
          <p className="text-slate-400">Ingresa con tu cuenta de Keycloak</p>
        </div>

        {/* Login con Keycloak OAuth2 - FLUJO CORRECTO */}
        <div className="space-y-4">
          <button
            onClick={handleKeycloakLogin}
            disabled={isLoading}
            className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

          {/* Info sobre el flujo */}
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300 text-center">
              Serás redirigido a <span className="text-indigo-400 font-medium">Keycloak</span> para autenticarte de forma segura.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
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