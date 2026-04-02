"use client";

import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  price: number;
  className?: string;
}

/**
 * AddToCartButton - Botón para añadir al carrito
 * 
 * FAANG'26: "Zero Friction until Checkout"
 * - Productos públicos (cualquiera puede ver)
 * - Añadir al carrito ANÓNIMO (sin login)
 * - Carrito se guarda en localStorage
 * - Solo en CHECKOUT se requiere autenticación
 */
export function AddToCartButton({ productId, productName, price, className = "" }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Siempre añadir al carrito - sin importar si está autenticado
    // El login solo se pide en el checkout (Auth Wall)
    addItem({
      productId,
      name: productName,
      price,
    });
    
    // Feedback visual
    toast.success(`${productName} añadido al carrito`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors ${className}`}
    >
      Añadir al Carrito
    </button>
  );
}

/**
 * PopularProductsClient - Componente de cliente para la sección de productos populares
 * Muestra productos públicos - acceso SIN autenticación
 */
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export function PopularProductsClient({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all hover:transform hover:scale-105"
        >
          {/* Product Image */}
          <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl">
            {product.image}
          </div>
          
          {/* Product Info */}
          <div className="p-6">
            <span className="inline-block px-3 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded-full mb-3">
              {product.category}
            </span>
            <h3 className="text-xl font-semibold text-white mb-2">
              {product.name}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-400">
                ${product.price.toFixed(2)}
              </span>
              
              {/* Botón Añadir al Carrito - PÚBLICO, sin login */}
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                price={product.price}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}