"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  sessionId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "eshop-anonymous-cart";
const SESSION_KEY = "eshop-session-id";

/**
 * CartContext - Persistencia anónima FAANG'26
 * 
 * - Guarda en localStorage paraicarrito anónimo
 * - Genera un sessionId único para el usuario anónimo
 * - En checkout, el sessionId se asocia al usuario autenticado
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Generar sessionId único al cargar
  useEffect(() => {
    let session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      session = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(SESSION_KEY, session);
    }
    setSessionId(session);

    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (e) {
        console.warn("Error loading cart from localStorage:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (product: Omit<CartItem, "id" | "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.productId);
      
      if (existingItem) {
        toast.success(`Cantidad actualizada en el carrito`);
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      toast.success(`${product.name} agregado al carrito`);
      return [...prev, { ...product, id: Date.now(), quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Producto eliminado del carrito");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("Carrito limpiado");
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, sessionId }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}