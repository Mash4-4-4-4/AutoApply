/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { 50: "#FFFBF5", 100: "#FBF3E8", 200: "#F3E6D3", 300: "#E8D5BC" },
        amber: { brand: "#FBBF45", deep: "#F2A91E" },
        ink: { DEFAULT: "#2B2623", soft: "#6F655E", faint: "#A89E95" },
      },
      borderRadius: { "4xl": "2rem" },
      boxShadow: { card: "0 6px 24px -8px rgba(120,80,30,0.18)" },
    },
  },
  plugins: [],
};
