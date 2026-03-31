"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { auth as authServer } from "@/auth";
import Link from "next/link";

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
  const { data: session, status } = useSession();
  const [products] = useState<Product[]>([
    { id: 1, name: "Laptop Pro 15", description: "高性能笔记本电脑", price: 1299.99, stock: 15, category: "Electronics" },
    { id: 2, name: "Wireless Mouse", description: "无线蓝牙鼠标", price: 29.99, stock: 50, category: "Accessories" },
    { id: 3, name: "USB-C Hub", description: "多端口集线器", price: 49.99, stock: 30, category: "Accessories" },
    { id: 4, name: "Mechanical Keyboard", description: "RGB机械键盘", price: 89.99, stock: 20, category: "Accessories" },
    { id: 5, name: "Monitor 27\"", description: "4K高清显示器", price: 399.99, stock: 10, category: "Electronics" },
    { id: 6, name: "Webcam HD", description: "1080P高清摄像头", price: 59.99, stock: 25, category: "Electronics" },
  ]);

  // Server-side auth check fallback
  let isAdmin = false;
  if (session?.user) {
    // Check for admin role from JWT claims
    const roles = (session as any)?.roles;
    isAdmin = Array.isArray(roles) && roles.includes("admin");
  }

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
                <span className="text-sm text-slate-600">{session.user?.email}</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {isAdmin ? "Admin" : "Cliente"}
                </span>
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

// Server component wrapper for initial data fetch
export async function ProductsLayout({ children }: { children: React.ReactNode }) {
  const session = await authServer();
  return <>{children}</>;
}