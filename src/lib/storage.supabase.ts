import { supabase } from '@/integrations/supabase/client';
import { Product, Sale, DashboardStats } from '@/types/inventory';

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from<any>('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    id: String(p.id),
    name: p.name,
    category: p.category,
    quantity: p.quantity,
    costPrice: Number(p.cost_price ?? 0),
    sellingPrice: Number(p.selling_price ?? 0),
    supplier: p.supplier ?? undefined,
    serialNumber: p.serial_number ?? undefined,
    minStockLevel: Number(p.min_stock_level ?? 0),
    createdAt: new Date(p.created_at as unknown as string),
    updatedAt: new Date(p.updated_at as unknown as string),
  } as Product));
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const payload = {
    name: product.name,
    category: product.category,
    quantity: product.quantity,
    cost_price: product.costPrice,
    selling_price: product.sellingPrice,
    supplier: product.supplier ?? null,
    serial_number: product.serialNumber ?? null,
    min_stock_level: product.minStockLevel,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any;
  // debug: log payload shape before inserting (helps catch unexpected types)
  // eslint-disable-next-line no-console
  console.debug('storage.supabase.addProduct payload:', {
    name: payload.name,
    category: payload.category,
    quantity: payload.quantity,
    cost_price: payload.cost_price,
    selling_price: payload.selling_price,
    supplier: payload.supplier,
    serial_number: payload.serial_number,
    min_stock_level: payload.min_stock_level,
  });

  const { data, error } = await supabase.from<any>('products').insert(payload).select().single();
  if (error) throw error;
  const p = data as any;
  return {
    id: String(p.id),
    name: p.name,
    category: p.category,
    quantity: p.quantity,
    costPrice: Number(p.cost_price ?? 0),
    sellingPrice: Number(p.selling_price ?? 0),
    supplier: p.supplier ?? undefined,
    serialNumber: p.serial_number ?? undefined,
    minStockLevel: Number(p.min_stock_level ?? 0),
    createdAt: new Date(p.created_at as unknown as string),
    updatedAt: new Date(p.updated_at as unknown as string),
  } as Product;
};

export const updateProduct = async (id: string, patch: Partial<Product>): Promise<Product | null> => {
  const payload: any = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.quantity !== undefined) payload.quantity = patch.quantity;
  if (patch.costPrice !== undefined) payload.cost_price = patch.costPrice;
  if (patch.sellingPrice !== undefined) payload.selling_price = patch.sellingPrice;
  if (patch.supplier !== undefined) payload.supplier = patch.supplier;
  if (patch.serialNumber !== undefined) payload.serial_number = patch.serialNumber;
  if (patch.minStockLevel !== undefined) payload.min_stock_level = patch.minStockLevel;

  // debug: log update payload
  // eslint-disable-next-line no-console
  console.debug('storage.supabase.updateProduct', { id, payload });

  const { data, error } = await supabase.from<any>('products').update(payload).eq('id', id).select().single();
  if (error) throw error;
  const p = data as any;
  return {
    id: String(p.id),
    name: p.name,
    category: p.category,
    quantity: p.quantity,
    costPrice: Number(p.cost_price ?? 0),
    sellingPrice: Number(p.selling_price ?? 0),
    supplier: p.supplier ?? undefined,
    serialNumber: p.serial_number ?? undefined,
    minStockLevel: Number(p.min_stock_level ?? 0),
    createdAt: new Date(p.created_at as unknown as string),
    updatedAt: new Date(p.updated_at as unknown as string),
  } as Product;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  // eslint-disable-next-line no-console
  console.debug('storage.supabase.deleteProduct', { id });
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase.from<any>('sales').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    id: String(s.id),
    productId: s.product_id != null ? String(s.product_id) : '',
    productName: s.product_name,
    quantity: s.quantity,
    unitPrice: Number(s.unit_price ?? 0),
    totalAmount: Number(s.total_amount ?? 0),
    customerName: s.customer_name ?? undefined,
    createdAt: new Date(s.created_at as unknown as string),
  } as Sale));
};

export const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale | null> => {
  // Use RPC add_sale if available for atomicity, otherwise fall back to sequential operations
  try {
    // debug: log RPC params (avoid logging secrets)
    // eslint-disable-next-line no-console
    console.debug('storage.supabase.addSale RPC params:', {
      p_product_id: sale.productId,
      p_quantity: sale.quantity,
      p_unit_price: sale.unitPrice,
    });

    const rpc = await supabase.rpc('add_sale', {
      p_product_id: sale.productId,
      p_quantity: sale.quantity,
      p_unit_price: sale.unitPrice,
      p_product_name: sale.productName ?? null,
      p_total_amount: sale.totalAmount ?? (sale.unitPrice * sale.quantity),
      p_customer_name: sale.customerName ?? null,
    });
    console.debug('addSale RPC response', rpc);
    if ((rpc as any).error) throw (rpc as any).error;
    const result = (rpc as any).data?.[0] ?? (rpc as any).data;
    console.debug('addSale RPC result', result);
    if (!result) return null;
    return {
      id: String(result.id),
      productId: result.productid != null ? String(result.productid) : (result.productId != null ? String(result.productId) : ''),
      productName: sale.productName,
      quantity: result.quantity,
      unitPrice: result.unitprice ?? result.unitPrice,
      totalAmount: sale.totalAmount,
      createdAt: new Date(result.createdat ?? result.createdAt),
    } as Sale;
  } catch (e) {
    console.error('addSale RPC failed, falling back to sequential path', e);
    // If RPC fails, perform sequential operations (less safe for concurrency).
    // eslint-disable-next-line no-console
    console.debug('storage.supabase.addSale fallback path - fetching product', { productId: sale.productId });
    const { data: prodData, error: prodErr } = await supabase.from<any>('products').select('*').eq('id', sale.productId).single();
    if (prodErr) throw prodErr;
    const product = prodData as any;
    if (!product || product.quantity < sale.quantity) return null;

    const { error: updErr } = await supabase.from('products').update({ quantity: product.quantity - sale.quantity, updated_at: new Date().toISOString() }).eq('id', product.id);
    if (updErr) throw updErr;

    const payload = {
      product_id: sale.productId,
      product_name: sale.productName,
      quantity: sale.quantity,
      unit_price: sale.unitPrice,
      total_amount: sale.totalAmount,
      customer_name: sale.customerName ?? null,
      created_at: new Date().toISOString(),
    } as any;
    // eslint-disable-next-line no-console
    console.debug('storage.supabase.addSale fallback - inserting sale', { payload: { product_id: payload.product_id, quantity: payload.quantity, unit_price: payload.unit_price } });
    const { data: saleData, error: saleErr } = await supabase.from<any>('sales').insert(payload).select().single();
    if (saleErr) throw saleErr;
    const s = saleData as any;
    return {
      id: String(s.id),
      productId: s.product_id != null ? String(s.product_id) : '',
      productName: s.product_name,
      quantity: s.quantity,
      unitPrice: Number(s.unit_price ?? 0),
      totalAmount: Number(s.total_amount ?? 0),
      customerName: s.customer_name ?? undefined,
      createdAt: new Date(s.created_at as unknown as string),
    } as Sale;
  }
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  // Supabase filters expect literal values; comparing two columns server-side
  // via the client is not supported. Fetch products and filter client-side.
  const { data, error } = await supabase.from<any>('products').select('*').order('quantity', { ascending: true });
  if (error) throw error;
  const low = (data ?? []).filter((p: any) => Number(p.quantity ?? 0) <= Number(p.min_stock_level ?? 0));
  return low.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    quantity: p.quantity,
    costPrice: Number(p.cost_price ?? 0),
    sellingPrice: Number(p.selling_price ?? 0),
    supplier: p.supplier ?? undefined,
    serialNumber: p.serial_number ?? undefined,
    minStockLevel: Number(p.min_stock_level ?? 0),
    createdAt: new Date(p.created_at as unknown as string),
    updatedAt: new Date(p.updated_at as unknown as string),
  } as Product));
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get product count
  const { count: prodCount } = await supabase.from('products').select('id', { count: 'exact' });

  // Compute inventory total value = sum(cost_price * quantity)
  const { data: prodRows, error: prodRowsErr } = await supabase.from<any>('products').select('cost_price,quantity');
  if (prodRowsErr) throw prodRowsErr;
  const totalValue = (prodRows ?? []).reduce((acc: number, p: any) => acc + (Number(p.cost_price ?? 0) * Number(p.quantity ?? 0)), 0);

  // Low stock items (use existing helper)
  let lowStockCount = 0;
  try {
    const low = await getLowStockProducts();
    lowStockCount = low.length;
  } catch (_) {
    lowStockCount = 0;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: todaySales, error: todayErr } = await supabase.from<any>('sales').select('quantity,unit_price,created_at').gte('created_at', `${today}T00:00:00Z`);
  if (todayErr) throw todayErr;
  const todayRevenue = (todaySales ?? []).reduce((s: number, r: any) => s + (r.quantity * (Number(r.unit_price ?? 0))), 0);

  return {
    totalProducts: Number(prodCount ?? 0),
    totalValue,
    lowStockItems: lowStockCount,
    todaySales: todayRevenue,
    weeklySales: 0,
    monthlySales: 0,
  } as any;
};

  export const deleteSale = async (saleId: string): Promise<boolean> => {
    // Remove a sale and restore product quantity atomically where possible.
    // This implementation performs steps sequentially via the client; for
    // stronger guarantees create a DB-side RPC that performs the operations
    // inside a transaction.
    try {
      // fetch sale
      const { data: saleData, error: saleErr } = await supabase.from<any>('sales').select('*').eq('id', saleId).single();
      if (saleErr) throw saleErr;
      if (!saleData) return false;

      const productId = saleData.product_id;
      const qty = Number(saleData.quantity ?? 0);

      // Try DB-side transactional RPC first for atomic delete+restore (recommended).
      try {
        // eslint-disable-next-line no-console
        console.debug('deleteSale: attempting RPC delete_sale_tx', { saleId });
        const rpcResp = await supabase.rpc('delete_sale_tx', { p_sale_id: saleId });
        // rpcResp may contain error/data depending on function
        if ((rpcResp as any).error) {
          // eslint-disable-next-line no-console
          console.warn('deleteSale: RPC delete_sale_tx returned error, falling back', { saleId, error: (rpcResp as any).error });
        } else {
          // eslint-disable-next-line no-console
          console.debug('deleteSale: RPC delete_sale_tx succeeded', { saleId, data: (rpcResp as any).data });
          return true;
        }
      } catch (rpcEx) {
        // eslint-disable-next-line no-console
        console.warn('deleteSale: rpc call failed or not found, falling back to client-side flow', { saleId, error: rpcEx });
      }

      // If the sale has no associated product id, attempt delete only
      if (!productId) {
        // eslint-disable-next-line no-console
        console.warn('deleteSale: sale has no associated product_id; deleting sale without restoring stock', { saleId });
        const { error: delErr } = await supabase.from('sales').delete().eq('id', saleId);
        if (delErr) throw delErr;
        return true;
      }

      // Delete sale first to avoid repeated inventory restores when delete fails
      // Use `.select()` so the API returns the deleted rows (helps debug permissions/caching)
      const delResp = await supabase.from('sales').delete().eq('id', saleId).select();
      const delErr = (delResp as any).error;
      const delData = (delResp as any).data;
      // Log the response for debugging (client will surface errors)
      // eslint-disable-next-line no-console
      console.debug('deleteSale: delete response', { saleId, delErr, delData });

      if (delErr) {
        // eslint-disable-next-line no-console
        console.error('deleteSale: failed to delete sale record, aborting inventory update', { saleId, error: delErr });
        throw delErr;
      }

      // If delete returned no rows, surface that as an error so caller can detect unexpected server behavior
      if (!delData || (Array.isArray(delData) && delData.length === 0)) {
        const msg = `deleteSale: delete returned no rows for id=${saleId}`;
        // eslint-disable-next-line no-console
        console.warn(msg, { saleId, delData });
        throw new Error(msg);
      }

      // Now update/increment product quantity
      try {
        const { data: prodData, error: prodErr } = await supabase.from<any>('products').select('id,quantity').eq('id', productId).single();
        if (prodErr) throw prodErr;
        if (!prodData) {
          // eslint-disable-next-line no-console
          console.error('deleteSale: associated product not found for productId after sale delete', { saleId, productId });
          return true; // sale deleted; nothing more to do
        }
        const newQty = Number(prodData.quantity ?? 0) + qty;
        const { error: updErr } = await supabase.from('products').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', productId);
        if (updErr) {
          // eslint-disable-next-line no-console
          console.error('deleteSale: sale deleted but failed to update product quantity', { saleId, productId, qty, error: updErr });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('deleteSale: unexpected error while updating product quantity after sale deletion', { saleId, productId, error: e });
      }

      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('deleteSale failed', e);
      throw e;
    }
  };
