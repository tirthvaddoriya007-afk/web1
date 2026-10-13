/**
 * Tailwind config for the PHP storefront (homeshop-php).
 * Scans the .php pages and assets/app.js so every utility class used in the
 * ported markup gets generated — same classes the Next.js app used.
 */
module.exports = {
  content: [
    './homeshop-php/**/*.php',
    './homeshop-php/assets/*.js',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#9f2089',
          dark: '#570b47',
          deep: '#60014a',
          bar: '#970e71',
          light: '#ffe7fb',
        },
        greyBase: '#333333',
        greyT1: '#666666',
        greyT2: '#9b9b9b',
        greenBase: '#03A685',
      },
      maxWidth: {
        app: '400px',
      },
      fontFamily: {
        sans: ['var(--font-app)', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
