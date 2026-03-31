/**
 * API Client with JWT Interceptor
 * Follows BFF (Backend for Frontend) pattern to communicate with Spring Boot backend
 * 
 * Every request automatically includes the Bearer token from NextAuth session
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

// Base URL for backend Spring Boot API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * Request interceptor - Adds JWT token from NextAuth session to every request
 * This ensures the backend receives the original Keycloak access token
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get the session to access the access token
      const session = await getSession();
      
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      
      return config;
    } catch (error) {
      // If session retrieval fails, continue without token
      // The backend will handle unauthorized requests
      console.warn("Could not retrieve session for API call:", error);
      return config;
    }
  },
  (error: AxiosError) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle common error scenarios
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Could trigger a token refresh flow here in the future
      console.warn("Unauthorized API call - token may be expired");
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post("/auth/login", { username, password }),
  
  refresh: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),
  
  me: () => apiClient.get("/auth/me"),
  
  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refreshToken }),
};

export const productsApi = {
  getAll: () => apiClient.get("/products"),
  
  getById: (id: number) => apiClient.get(`/products/${id}`),
  
  getByCategory: (category: string) => apiClient.get(`/products/category/${category}`),
  
  getInStock: () => apiClient.get("/products/in-stock"),
  
  search: (query: string) => apiClient.get(`/products/search?q=${encodeURIComponent(query)}`),
  
  create: (product: CreateProductDto) => apiClient.post("/products", product),
  
  update: (id: number, product: UpdateProductDto) => apiClient.put(`/products/${id}`, product),
  
  delete: (id: number) => apiClient.delete(`/products/${id}`),
  
  updateStock: (id: number, stock: number) =>
    apiClient.patch(`/products/${id}/stock`, { stock }),
};

export const ordersApi = {
  getAll: () => apiClient.get("/orders"),
  
  getById: (id: number) => apiClient.get(`/orders/${id}`),
  
  getByClient: (clientName: string) => apiClient.get(`/orders/client/${clientName}`),
  
  getByStatus: (status: string) => apiClient.get(`/orders/status/${status}`),
  
  getClientOrders: () => apiClient.get("/orders/client"),
  
  create: (nombreCliente: string, esPedidoInterno: boolean = false) =>
    apiClient.post("/orders", { nombreCliente, esPedidoInterno }),
  
  addItem: (orderId: number, productId: number, cantidad: number) =>
    apiClient.post(`/orders/${orderId}/items`, { productId, cantidad }),
  
  updateStatus: (orderId: number, nuevoEstado: string) =>
    apiClient.patch(`/orders/${orderId}/status`, { nuevoEstado }),
  
  cancel: (orderId: number) => apiClient.post(`/orders/${orderId}/cancel`),
  
  delete: (id: number) => apiClient.delete(`/orders/${id}`),
  
  countByStatus: (status: string) => apiClient.get(`/orders/count/${status}`),
};

// Type definitions (mirroring Java DTOs)
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category: string;
  imageUrl?: string;
}

export interface UpdateProductDto extends CreateProductDto {
  stock: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Order {
  id: number;
  fechaCreacion: string;
  nombreCliente: string;
  estado: string;
  total: number;
  esPedidoInterno: boolean;
  items: OrderItem[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  givenName?: string;
  familyName?: string;
  emailVerified?: boolean;
  roles: string[];
}

// Export the configured axios instance for custom usage
export default apiClient;