export interface AdditionalInfoRow {
  label: string;
  value: string;
}

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
  /** Product Highlights — admin-entered at upload time. */
  fabric?: string;
  color?: string;
  pattern?: string;
  fit_shape?: string;
  /** Additional Information dropdown — admin-entered key–value rows. */
  additional_info?: AdditionalInfoRow[];
}

export interface Category {
  id?: number;
  slug: string;
  origSlug: string;
  name: string;
  count?: number;
}

/** Quantity offer selected on the PDP — e.g. Buy 2 Get 20% OFF. */
export interface CartOffer {
  /** Units the offer is sold as (2 or 3). */
  qty: number;
  /** Discount applied to every unit of this cart line (20 or 30). */
  discountPct: number;
}

export interface CartItem {
  hash: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  qty: number;
  /** Selected size (S/M/L/XL/XXL/XXXL) — optional so older saved carts still load. */
  size?: string;
  /** PDP offer chip applied to this line; null = regular single buy. */
  offer?: CartOffer | null;
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
  /** Seconds the welcome landing stays before auto-redirect to /home; 0 disables. Decimals allowed (0.5, 1.8…). */
  welcome_redirect_seconds: number;
  /** Master switch: false = welcome page skipped entirely, / goes straight to /home. */
  welcome_enabled: boolean;
}
