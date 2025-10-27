// @ts-check
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0b0b10",
        graphite: "#14141a",
        slate: "#1c1c22",
        iron: "#22222a",
        ash: "#2a2a33",
        neon: {
          emerald: "#2de5b9",
          blue: "#3b82f6",
          orange: "#f97316",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        numeric: ["var(--font-numeric)", "monospace"],
      },
      boxShadow: {
        "surface": "0 18px 45px -30px rgba(45,229,185,0.4)",
        "glow-blue": "0 0 40px rgba(59,130,246,0.35)",
      },
      keyframes: {
        "score-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(45,229,185,0.0)" },
          "50%": { boxShadow: "0 0 20px 2px rgba(45,229,185,0.35)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "ticker-slide": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "score-pulse": "score-pulse 2s ease-in-out",
        shimmer: "shimmer 2.4s linear infinite",
        "ticker-slide": "ticker-slide 40s linear infinite",
      },
      letterSpacing: {
        "mega": "0.3em",
      },
    },
  },
  plugins: [],
} satisfies Config
