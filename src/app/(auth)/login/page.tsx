"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login credentials state
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
  });
  const [registerError, setRegisterError] = useState("");

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

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        username: loginData.username,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenciales inválidas");
        setIsLoading(false);
      } else {
        router.push("/products");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  // ========== REGISTER HANDLERS ==========

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    // Validaciones
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }
    
    if (registerData.password.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerData.name,
          lastName: registerData.lastName,
          email: registerData.email,
          password: registerData.password,
          telephone: registerData.telephone || "0000000000",
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        toast.success("Usuario registrado correctamente");
        
        // Hacer login automático después del registro
        const result = await signIn("credentials", {
          username: registerData.email,
          password: registerData.password,
          redirect: false,
        });

        if (!result?.error) {
          router.push("/products");
          router.refresh();
        }
      } else {
        setRegisterError(data.message || "Error al registrar usuario");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Register error:", error);
      setRegisterError("Error al conectar con el servidor");
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

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-slate-800/50 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "login"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "register"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* LOGIN TAB */}
        {activeTab === "login" && (
          <div className="space-y-6">
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-500">o</span>
              </div>
            </div>

            {/* Login con credenciales */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ypmanrique15@gmail.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* REGISTER TAB */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label htmlFor="reg-lastName" className="block text-sm font-medium text-slate-300 mb-2">
                  Apellido
                </label>
                <input
                  id="reg-lastName"
                  type="text"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-2">
                Correo electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="juan@ejemplo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-telephone" className="block text-sm font-medium text-slate-300 mb-2">
                Teléfono (opcional)
              </label>
              <input
                id="reg-telephone"
                type="tel"
                value={registerData.telephone}
                onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+51 999 999 999"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <input
                id="reg-confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {registerError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {registerError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </form>
        )}

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