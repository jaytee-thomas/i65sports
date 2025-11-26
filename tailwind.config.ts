import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NEW: Deeper, higher contrast backgrounds
        midnight: "#0A0E14",
        graphite: "#1A1F2E", 
        iron: "#242B3D",
        ash: "#2D3748",
        
        // NEW: Additional accent colors
        "neon-emerald": "#00FF88",
        "hot-pink": "#FF3366",
        "electric-blue": "#00D9FF",
        "gold": "#FFB800",
        "live-green": "#00FF88",
        "danger-red": "#FF4757",
        
        // NEW: Better text colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#8B95A8",
        "text-muted": "#4A5568",
        
        // Semantic color aliases
        "background-dark": "#0A0E14",
        "background-medium": "#1A1F2E",
        "background-light": "#242B3D",
        "accent": "#00FF88",
        "border": "#2D3748",
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      },
      fontSize: {
        "hero": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "900" }],
        "title": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "800" }],
      },
      maxWidth: {
        "container": "1400px",
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
};

export default config;
