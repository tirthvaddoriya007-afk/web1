// =============================================================================
// BRAND CONFIG — single source of truth for store branding and seller details.
// =============================================================================

export const brand = {
  // Shown in the header, titles, footer, everywhere.
  name: "MEGA SALE",
  logoPath: "/mega-sale-logo.png",
  tagline: "Online Store",
  siteUrl: "https://megasale-nine.vercel.app",

  seller: {
    legalName: "SHK Enterprise",
    proprietor: "V.M. Patel",
    address: "Pragati IT Park, Yogichowk, Surat, Gujarat 395011, India",
    gstin: null,
  },

  // Theme colors (kept in sync with tailwind.config.ts `brand` palette).
  colors: {
    primary: "#9f2089",
    primaryDark: "#570b47",
    bar: "#970e71",
  },

  currency: "₹",

  // Promo strip text (marquee).
  promo: "Browse products across our store.",

  // Support contact shown on the Help page.
  support: {
    email: "shkenterprise2023@gmail.com",
    whatsapp: "+91 8160564944",
    hours: "10:00 AM–5:00 PM",
  },
};

export type Brand = typeof brand;
