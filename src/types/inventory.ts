export type Category = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  serialNumber?: string;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
}

export const CATEGORIES: Category[] = [];
