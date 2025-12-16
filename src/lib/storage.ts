// Adapter loader: choose local or supabase implementation based on env
// Both adapters expose the same async API.
let adapter: any;

const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

if (useSupabase) {
  // lazy import supabase adapter
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  adapter = await import('./storage.supabase');
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  adapter = await import('./storage.local');
}

export const getProducts = adapter.getProducts;
export const saveProducts = adapter.saveProducts;
export const addProduct = adapter.addProduct;
export const updateProduct = adapter.updateProduct;
export const deleteProduct = adapter.deleteProduct;
export const getSales = adapter.getSales;
export const saveSales = adapter.saveSales;
export const addSale = adapter.addSale;
export const deleteSale = adapter.deleteSale;
export const getLowStockProducts = adapter.getLowStockProducts;
export const getDashboardStats = adapter.getDashboardStats;
