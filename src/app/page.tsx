import Link from "next/link";
import { auth } from "@/auth";
import { PopularProductsClient } from "@/components/add-to-cart-button";

/**
 * Landing Page - FAANG'26 Architecture
 * 
 * Muestra los 3 productos más populares con botón de añadir al carrito.
 * Si el usuario no está autenticado, al hacer click en "Añadir" redirige a /login
 */

// Productos populares (mock - en producción vendría del backend)
const POPULAR_PRODUCTS = [
  {
    id: 1,
    name: "Laptop Pro 15",
    description: "Potente laptop para profesionales",
    price: 1299.99,
    category: "Electronics",
    image: "💻"
  },
  {
    id: 2,
    name: "Wireless Mouse",
    description: "Mouse inalámbrico Bluetooth",
    price: 29.99,
    category: "Accessories",
    image: "🖱️"
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    description: "Teclado mecánico RGB",
    price: 89.99,
    category: "Accessories",
    image: "⌨️"
  }
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC41Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0tNC00aC0ydi0yaDJ2MnptLTQtNGgtMnYtMmgydjJ6bTAtNGgtMnYtMmgyVjIweiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>

        {/* Navbar */}
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              <span className="text-2xl font-bold text-white">
                eShop <span className="text-indigo-400">OEM</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/products"
                    className="text-slate-300 hover:text-white font-medium transition-colors"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/orders"
                    className="text-slate-300 hover:text-white font-medium transition-colors"
                  >
                    Mis Pedidos
                  </Link>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-300 text-sm">
                    {session.user?.email}
                  </span>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            La Plataforma de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Comercio Electrónico
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Una solución SaaS completa para tu negocio. Productos, pedidos,
            facturación electrónica y más.
          </p>
          <div className="flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/products"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:scale-105"
              >
                Ver Productos
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:scale-105"
                >
                  Comenzar Ahora
                </Link>
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all hover:scale-105">
                  Saber Más
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Popular Products Section - Cliente component para sesión */}
      <div className="bg-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Productos Destacados
            </h2>
            <p className="text-slate-400">
              Los productos más populares de nuestra tienda
            </p>
          </div>

          <PopularProductsClient products={POPULAR_PRODUCTS} />

          {/* Ver más productos */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-colors"
            >
              Ver todos los productos
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Características Principales
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu tienda en línea
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Gestión de Productos
              </h3>
              <p className="text-slate-400">
                Catálogo completo con categorías, búsqueda y control de stock
                en tiempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Pedidos y Carrito
              </h3>
              <p className="text-slate-400">
                Carrito de compras intuitivo y seguimiento completo de
                pedidos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Factura Electrónica
              </h3>
              <p className="text-slate-400">
                Envío automático de facturas y comprobantes por correo
                electrónico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Tecnología de Última Generación
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-2xl">⚛️</span>
              <span className="font-medium">React 19</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-2xl">▲</span>
              <span className="font-medium">Next.js 15</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-2xl">☕</span>
              <span className="font-medium">Java 21</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-2xl">🍃</span>
              <span className="font-medium">Spring Boot 3.5</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-2xl">🐘</span>
              <span className="font-medium">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-2xl">🔐</span>
              <span className="font-medium">Keycloak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500">
            © 2026 eShop OEM. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}