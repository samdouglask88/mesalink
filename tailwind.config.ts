import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // paleta "hamburgueria": carvão + âmbar/mostarda
        brand: {
          50: "#fff8ed",
          100: "#fdecc8",
          400: "#f2b544",
          500: "#e69a1f",
          600: "#c97c12",
        },
      },
    },
  },
  plugins: [],
};

export default config;
