"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSync } from "@/lib/hooks/use-auth-sync";
import { signOut, useSession } from "next-auth/react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  // Usar el hook de sincronización automática
  const { session: authSession, status, syncedUser, isSyncing, isAdmin } = useAuthSync();
  
  const [products] = useState<Product[]>([
    { id: 1, name: "Laptop Pro 15", description: "Potente laptop para profesionales", price: 1299.99, stock: 15, category: "Electronics" },
    { id: 2, name: "Wireless Mouse", description: "Mouse inalámbrico Bluetooth", price: 29.99, stock: 50, category: "Accessories" },
    { id: 3, name: "USB-C Hub", description: "Hub multiPuerto USB-C", price: 49.99, stock: 30, category: "Accessories" },
    { id: 4, name: "Mechanical Keyboard", description: "Teclado mecánico RGB", price: 89.99, stock: 20, category: "Accessories" },
    { id: 5, name: "Monitor 27\"", description: "Monitor 4K UHD", price: 399.99, stock: 10, category: "Electronics" },
    { id: 6, name: "Webcam HD", description: "Cámara web 1080P", price: 59.99, stock: 25, category: "Electronics" },
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Acceso Restringido</h2>
          <p className="text-slate-600 mb-4">Debes iniciar sesión para ver los productos</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              eShop <span className="text-indigo-600">OEM</span>
            </h1>
            <nav className="flex items-center gap-6">
              <Link href="/products" className="text-slate-600 hover:text-indigo-600 font-medium">
                Productos
              </Link>
              <Link href="/cart" className="text-slate-600 hover:text-indigo-600 font-medium">
                Carrito
              </Link>
              <Link href="/orders" className="text-slate-600 hover:text-indigo-600 font-medium">
                Mis Pedidos
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-slate-600 hover:text-indigo-600 font-medium">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2">
                {/* Info de sincronización */}
                <span className="text-sm text-slate-600">
                  {syncedUser?.email || session.user?.email}
                </span>
                {isSyncing && (
                  <span className="text-xs text-blue-500 animate-pulse">sincronizando...</span>
                )}
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                  {isAdmin ? "Admin" : (syncedUser?.dbRole || "Cliente")}
                </span>
                <button
                  onClick={async () => {
                    // Primero cerrar sesión en NextAuth
                    await signOut({ callbackUrl: "/login", redirect: false });
                    // Luego redirigir al logout de Keycloak para cerrar completamente
                    // NO usamos id_token_hint porque no lo tenemos disponible facilmente
                    const keycloakLogoutUrl = `${process.env.AUTH_KEYCLOAK_ISSUER || "http://localhost:8081/realms/yadin-market"}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin + "/login")}`;
                    window.location.href = keycloakLogoutUrl;
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium p-1 rounded hover:bg-red-50 transition-colors"
                  title="Cerrar Sesión"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Catálogo de Productos</h2>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Buscar productos..."
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                  <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
                  </span>
                </div>
                <button className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}