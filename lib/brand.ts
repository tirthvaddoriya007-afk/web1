// =============================================================================
// BRAND CONFIG — single source of truth for all branding.
// Change these values to rebrand the entire app. Nothing else needs editing.
// The reference site impersonated a real brand; this clone ships a neutral
// placeholder identity that you replace with your own here.
// =============================================================================

export const brand = {
  // Shown in the header, titles, footer, everywhere.
  name: "Mega sale",
  tagline: "Sale Sale Sale",

  // Logo: the Meesho wordmark extracted from
  // lavender-chimpanzee-574483.hostingersite.com/index.html. The header
  // renders this image whenever logoSrc is set.
  logoSrc: "/meesho-logo.png" as string,

  // Theme colors (kept in sync with tailwind.config.ts `brand` palette).
  colors: {
    primary: "#9f2089",
    primaryDark: "#570b47",
    bar: "#970e71",
  },

  currency: "₹",

  // Promo strip text (marquee).
  promo: "Get Upto 80% off on all products! Limited time offer.",

  // Support contact shown on the Help page.
  support: {
    email: "tirthvaddoriya007@gmail.com",
    whatsapp: "+91 81605 64944",
    hours: "Mon–Sat, 10am – 7pm",
  },
};

export type Brand = typeof brand;
