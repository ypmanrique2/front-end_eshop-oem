"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { useLogout } from "@/lib/use-logout";
import { toast } from "sonner";

/**
 * CartPage - Carrito PÚBLICO FAANG'26
 * 
 * - Cualquier usuario puede ver su carrito (sin login)
 * - Redirige a /checkout para completar la compra
 */
export default function CartPage() {
  const { data: session } = useSession();
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { logout } = useLogout();

  const handleCheckout = () => {
    // AUTH WALL - Solo usuarios autenticados pueden comprar
    if (!session) {
      toast.error("Debes iniciar sesión para completar tu compra");
      window.location.href = "/login?callbackUrl=/checkout";
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    // Redirigir a checkout
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Público */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              eShop <span className="text-indigo-600">OEM</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-slate-600 hover:text-indigo-600 font-medium">
                Inicio
              </Link>
              <Link href="/products" className="text-slate-600 hover:text-indigo-600 font-medium">
                Productos
              </Link>
              <Link href="/cart" className="text-indigo-600 font-medium flex items-center gap-1">
                Carrito
                {itemCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                    {itemCount}
                  </span>
                )}
              </Link>
              {session ? (
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Carrito de Compras</h2>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Tu carrito está vacío</h3>
            <p className="text-slate-500 mb-4">Agrega productos para comenzar</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Limpiar Carrito
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({itemCount} productos)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  <span>Ir a Checkout</span>
                </button>

                {!session && (
                  <p className="text-sm text-slate-500 text-center mt-3">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login?callbackUrl=/checkout" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      Iniciar sesión
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}