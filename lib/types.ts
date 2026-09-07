export interface Product {
  id: number | null;
  hash: string;
  name: string;
  price: number;
  mrp: number;
  off: string;
  image: string;
  badge: string;
  categories: string[];
  category: string;
}

export interface Category {
  slug: string;
  origSlug: string;
  name: string;
  count: number;
}

export interface CartItem {
  hash: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  qty: number;
}

export interface Address {
  name: string;
  number: string;
  pin: string;
  city: string;
  flat: string;
  area: string;
  state?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: Address;
  paymentMode: string;
  status: string;
  placedAt: string;
}
