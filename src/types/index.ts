export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestionnaire';
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  quantity: number;
  minStockAlert: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}