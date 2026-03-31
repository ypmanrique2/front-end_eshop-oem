"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Order {
  id: number;
  fechaCreacion: string;
  nombreCliente: string;
  estado: string;
  total: number;
  esPedidoInterno: boolean;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/bff/orders?myOrders=true");
      if (response.ok) {
        const data = await response.json();
        // Handle API response format: { success: true, data: [...] }
        setOrders(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Demo data for development
      setOrders([
        {
          id: 1,
          fechaCreacion: "2026-03-30T10:30:00",
          nombreCliente: "Cliente Demo",
          estado: "COMPLETADO",
          total: 259.99,
          esPedidoInterno: false,
          items: [
            { id: 1, productId: 1, productName: "Laptop Pro 15", cantidad: 1, precioUnitario: 199.99, subtotal: 199.99 },
            { id: 2, productId: 2, productName: "Wireless Mouse", cantidad: 2, precioUnitario: 29.99, subtotal: 59.98 },
          ],
        },
        {
          id: 2,
          fechaCreacion: "2026-03-28T15:45:00",
          nombreCliente: "Cliente Demo",
          estado: "PENDIENTE",
          total: 89.99,
          esPedidoInterno: false,
          items: [
            { id: 3, productId: 3, productName: "USB-C Hub", cantidad: 1, precioUnitario: 49.99, subtotal: 49.99 },
            { id: 4, productId: 4, productName: "Mechanical Keyboard", cantidad: 1, precioUnitario: 89.99, subtotal: 89.99 },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
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
          <p className="text-slate-600 mb-4">Debes iniciar sesión para ver tus pedidos</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "COMPLETADO":
        return "bg-green-100 text-green-700";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELADO":
        return "bg-red-100 text-red-700";
      case "EN_PROCESO":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

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
              <Link href="/orders" className="text-indigo-600 font-medium">
                Mis Pedidos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Mis Pedidos</h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tienes pedidos aún</h3>
            <p className="text-slate-500 mb-4">Cuando realices un pedido, podrás verlo aquí</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-500">Pedido #{order.id}</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded-full {getStatusColor(order.estado)}">
                      {order.estado}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(order.fechaCreacion).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                            📦
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.productName}</p>
                            <p className="text-sm text-slate-500">
                              {item.cantidad} x ${item.precioUnitario.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium text-slate-900">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-500">Total</span>
                      <p className="text-2xl font-bold text-indigo-600">${order.total.toFixed(2)}</p>
                    </div>
                    <button className="px-4 py-2 border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}