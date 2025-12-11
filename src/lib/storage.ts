import { Product, Sale } from '@/types/inventory';

const PRODUCTS_KEY = 'inventory_products';
const SALES_KEY = 'inventory_sales';

// Sample data for initial setup
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Hikvision 4MP Dome Camera',
    category: 'CCTV Cameras',
    quantity: 15,
    costPrice: 85,
    sellingPrice: 120,
    supplier: 'Hikvision Distributor',
    serialNumber: 'HK-4MP-001',
    minStockLevel: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'TP-Link Archer AX50 Router',
    category: 'WiFi Routers',
    quantity: 8,
    costPrice: 95,
    sellingPrice: 140,
    supplier: 'TP-Link Official',
    minStockLevel: 3,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'JBL Flip 6 Bluetooth Speaker',
    category: 'Speakers',
    quantity: 3,
    costPrice: 80,
    sellingPrice: 130,
    supplier: 'JBL Electronics',
    minStockLevel: 5,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Cat6 Ethernet Cable 50m',
    category: 'Cables',
    quantity: 25,
    costPrice: 15,
    sellingPrice: 28,
    supplier: 'Cable World',
    minStockLevel: 10,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'Ubiquiti UniFi Access Point',
    category: 'Networking',
    quantity: 2,
    costPrice: 150,
    sellingPrice: 220,
    supplier: 'Ubiquiti Networks',
    serialNumber: 'UB-UAP-005',
    minStockLevel: 3,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    name: 'HDMI Cable 2m Premium',
    category: 'Accessories',
    quantity: 40,
    costPrice: 5,
    sellingPrice: 12,
    supplier: 'Cable World',
    minStockLevel: 15,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
];

const sampleSales: Sale[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Hikvision 4MP Dome Camera',
    quantity: 2,
    unitPrice: 120,
    totalAmount: 240,
    customerName: 'John Smith',
    createdAt: new Date(),
  },
  {
    id: '2',
    productId: '4',
    productName: 'Cat6 Ethernet Cable 50m',
    quantity: 3,
    unitPrice: 28,
    totalAmount: 84,
    createdAt: new Date(Date.now() - 86400000),
  },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(sampleProducts));
    return sampleProducts;
  }
  return JSON.parse(stored).map((p: Product) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveProducts(products);
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
};

export const getSales = (): Sale[] => {
  const stored = localStorage.getItem(SALES_KEY);
  if (!stored) {
    localStorage.setItem(SALES_KEY, JSON.stringify(sampleSales));
    return sampleSales;
  }
  return JSON.parse(stored).map((s: Sale) => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }));
};

export const saveSales = (sales: Sale[]): void => {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

export const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>): Sale | null => {
  const products = getProducts();
  const product = products.find(p => p.id === sale.productId);
  
  if (!product || product.quantity < sale.quantity) {
    return null;
  }
  
  // Update product quantity
  updateProduct(sale.productId, { quantity: product.quantity - sale.quantity });
  
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  sales.unshift(newSale);
  saveSales(sales);
  return newSale;
};

export const getLowStockProducts = (): Product[] => {
  return getProducts().filter(p => p.quantity <= p.minStockLevel);
};

export const getDashboardStats = () => {
  const products = getProducts();
  const sales = getSales();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todaySales = sales
    .filter(s => new Date(s.createdAt) >= today)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const weeklySales = sales
    .filter(s => new Date(s.createdAt) >= weekAgo)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const monthlySales = sales
    .filter(s => new Date(s.createdAt) >= monthAgo)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);

  return {
    totalProducts: products.length,
    totalValue,
    lowStockItems: products.filter(p => p.quantity <= p.minStockLevel).length,
    todaySales,
    weeklySales,
    monthlySales,
  };
};
