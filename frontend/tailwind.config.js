/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CasaFlynn Brand Colors
        brand: {
          turquoise: {
            DEFAULT: '#14B8A6',  // Mediterranean turquoise - primary
            dark: '#0D9488',     // Darker shade for gradients/hovers
            light: '#2DD4BF',    // Lighter shade for hover states
          },
          cream: '#FAF5F1',      // Whitewashed walls - backgrounds
          brown: {
            DEFAULT: '#78350F',  // Warm brown - body text
            dark: '#44403C',     // Darker brown - footer/headings
          },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
