export interface Product {
  id: number | null;
  hash: string;
  name: string;
  price: number;
  mrp: number;
  off: string;
  image: string;
  images: string[];
  badge: string;
  categories: string[];
  category: string;
  order_number?: number;
}

export interface Category {
  id?: number;
  slug: string;
  origSlug: string;
  name: string;
  count?: number;
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

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface HomeContent {
  banner1_url: string;
  banner1_link: string;
  banner1_alt: string;
  banner2_url: string;
  banner2_link: string;
  banner2_alt: string;
  promo_text: string;
  /** Seconds the welcome landing stays before auto-redirect to /home; 0 disables. */
  welcome_redirect_seconds: number;
}
