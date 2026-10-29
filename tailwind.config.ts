import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand purple palette (from reference design; swap in lib/brand.ts + here)
        brand: {
          DEFAULT: "#9f2089",
          dark: "#570b47",
          deep: "#60014a",
          bar: "#970e71",
          light: "#ffe7fb",
        },
        greyBase: "#333333",
        greyT1: "#666666",
        greyT2: "#9b9b9b",
        greenBase: "#03A685",
      },
      maxWidth: {
        app: "400px",
      },
      fontFamily: {
        sans: ["var(--font-app)", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
