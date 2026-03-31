"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export default function CartPage() {
  const { data: session, status } = useSession();
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!session) {
      toast.error("Debes iniciar sesión para completar tu compra");
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order in backend
      const orderResponse = await fetch("/api/bff/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCliente: session.user?.email || "Cliente",
          esPedidoInterno: false,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Error al crear el pedido");
      }

      const order = await orderResponse.json();

      // Add items to order
      for (const item of items) {
        await fetch(`/api/bff/orders/${order.data.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            cantidad: item.quantity,
          }),
        });
      }

      clearCart();
      toast.success("¡Pedido creado exitosamente! Revisa tu correo para la factura.");
      window.location.href = "/orders";
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
              <Link href="/cart" className="text-indigo-600 font-medium">
                Carrito ({itemCount})
              </Link>
              <Link href="/orders" className="text-slate-600 hover:text-indigo-600 font-medium">
                Mis Pedidos
              </Link>
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
                  disabled={isCheckingOut || !session}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : !session ? (
                    <span>Inicia sesión para comprar</span>
                  ) : (
                    <span>Completar Compra</span>
                  )}
                </button>

                {!session && (
                  <p className="text-sm text-slate-500 text-center mt-3">
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
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