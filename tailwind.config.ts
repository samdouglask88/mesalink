import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta legada do MesaLink (mantida p/ não quebrar telas internas).
        brand: {
          50: "#fff8ed",
          100: "#fdecc8",
          400: "#f2b544",
          500: "#e69a1f",
          600: "#c97c12",
        },
        // ── Identidade Urban Burger — "a alma do negócio" ───────────────
        // Carvão + laranja street. Tokens usados por toda a marca.
        urban: {
          bg: "#1C1C1C",        // fundo base
          surface: "#242424",   // cards / superfícies elevadas
          elevated: "#2C2C2C",  // hover / superfície acima do card
          line: "#333333",      // bordas sutis
          primary: "#F97316",   // laranja principal
          "primary-600": "#EA6A0A",
          "primary-300": "#FDBA74",
          light: "#F8FAFC",     // texto claro
          gray: "#4B5563",      // detalhes / texto terciário
          muted: "#9CA3AF",     // texto de apoio
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 45px -10px rgba(249,115,22,0.55)",
        "glow-sm": "0 0 24px -8px rgba(249,115,22,0.45)",
        card: "0 20px 50px -20px rgba(0,0,0,0.7)",
        "card-hover": "0 30px 70px -25px rgba(249,115,22,0.25)",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        "radial-orange":
          "radial-gradient(60% 60% at 50% 0%, rgba(249,115,22,0.18) 0%, rgba(28,28,28,0) 70%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "spin-slow": "spin-slow 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
