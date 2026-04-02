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

  // ========== KEYCLOAK LOGIN ==========

  const handleKeycloakLogin = async () => {
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

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700">
          {/* Info Message */}
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-indigo-300">
                <p className="font-medium mb-1">Autenticación segura con Keycloak</p>
                <p className="text-slate-400 text-xs">
                  Usa tu cuenta de Keycloak para acceder. Si no tienes una, regístrate desde la pantalla de login.
                </p>
              </div>
            </div>
          </div>

          {/* Keycloak Login Button - UNICO BOTÓN */}
          <button
            onClick={handleKeycloakLogin}
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
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
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
