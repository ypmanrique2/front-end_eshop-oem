"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useLogout } from "@/lib/use-logout";
import { toast } from "sonner";

/**
 * CheckoutPage - Página de checkout FAANG'26
 * 
 * Muestra formulario de datos del cliente y dirección de envío
 * Solo accesible para usuarios autenticados
 */
export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { logout } = useLogout();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state - email will be updated from session
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    pais: "Colombia",
    observaciones: "",
  });

  // Update email from session when it becomes available
  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: session.user?.email || "" }));
    }
  }, [session, session?.user?.email]);

  // Redirect if not authenticated - use useEffect to avoid SSR issues
  useEffect(() => {
    // Only redirect after session is fully loaded (not loading anymore)
    if (!session && items.length > 0) {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [session, router, items.length]);

  // Show loading while checking session
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tu carrito está vacío</h2>
          <p className="text-slate-600 mb-4">Agrega productos antes de proceder al checkout</p>
          <Link href="/products" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.email || !formData.direccion || !formData.ciudad || !formData.codigoPostal) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsProcessing(true);

    try {
      // Obtener token de la sesión
      const accessToken = (session as any)?.accessToken;
      
      if (!accessToken) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente");
        router.push("/login?callbackUrl=/checkout");
        return;
      }

      // Crear pedido en el backend
      const orderResponse = await fetch("/api/bff/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          nombreCliente: formData.email, // Usar email como identificador del cliente
          esPedidoInterno: false,
          // Enviar datos adicionales del pedido
          nombre: formData.nombre,
          telefono: formData.telefono,
          direccion: `${formData.direccion}, ${formData.ciudad}, ${formData.estado}, ${formData.codigoPostal}, ${formData.pais}`,
          observaciones: formData.observaciones,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear el pedido");
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.data?.id || orderResult.id;

      // Agregar items al pedido
      for (const item of items) {
        const itemResponse = await fetch(`/api/bff/orders/${orderId}/items`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            productId: item.productId,
            cantidad: item.quantity,
          }),
        });

        if (!itemResponse.ok) {
          console.error("Error adding item:", item.productId);
        }
      }

      // Limpiar carrito y redirigir a pedidos
      clearCart();
      toast.success("¡Pedido creado exitosamente! Te hemos enviado un correo de confirmación.");
      router.push("/orders");
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(`Error al procesar el pedido: ${error instanceof Error ? error.message : "Intenta de nuevo"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
              <Link href="/cart" className="text-slate-600 hover:text-indigo-600 font-medium">
                Carrito ({itemCount})
              </Link>
              <button onClick={logout} className="text-red-600 hover:text-red-800 font-medium">
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Checkout Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout - Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda: Formularios */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Datos del Cliente */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span>👤</span> Datos del Cliente
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Juan Perez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="juan@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span>📍</span> Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Calle 123 # 45-67, Apartamento 101"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Bogotá"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Estado / Provincia
                      </label>
                      <input
                        type="text"
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Cundinamarca"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="110111"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        País *
                      </label>
                      <select
                        name="pais"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Colombia">Colombia</option>
                        <option value="Venezuela">Venezuela</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="Peru">Perú</option>
                        <option value="Chile">Chile</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Mexico">México</option>
                        <option value="España">España</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Instrucciones especiales para la entrega..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen del Pedido</h2>
                
                {/* Lista de productos */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                        📦
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal ({itemCount} productos)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botón de pago */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Confirmar Pedido</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center mt-3">
                  Al confirmar tu pedido, recibirás un correo de confirmación
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}