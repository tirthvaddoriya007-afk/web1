/**
 * Product columns selected by every storefront query — server (lib/catalog.ts)
 * and client (ProductFeed paging, search) share this list so the Product type
 * stays consistent everywhere.
 */
export const PRODUCT_COLUMNS =
  "id, hash, name, price, mrp, off, image, images, badge, categories, category, order_number, fabric, color, pattern, fit_shape, additional_info";
