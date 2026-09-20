import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Kanit", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f9f3",
          100: "#dcf0e2",
          200: "#b8e1c6",
          500: "#2d6a4f",
          600: "#1b4332",
          700: "#153728",
          800: "#0f291e",
          900: "#081c14",
          950: "#04110c",
        },
        canvas: "#F4F2EB",
        beige: {
          100: "#EDE8DD",
        },
        forest: "#2D5F4F",
        gold: "#FFB347",
        slate: "#7A8FA3",
        cream: "#F5F1E8",
      },
      boxShadow: {
        glass:
          "0 8px 32px 0 rgba(20,48,30,0.08), inset 0 1px 1px 0 rgba(255,255,255,0.8), inset 0 -1px 1px 0 rgba(255,255,255,0.2)",
        "glass-hover":
          "0 20px 48px -6px rgba(18,50,32,0.16), 0 0 20px 2px rgba(167,243,208,0.35), inset 0 1.5px 2px 0 rgba(255,255,255,0.95)",
        "glass-card":
          "0 16px 40px -8px rgba(15,38,25,0.10), 0 2px 6px -1px rgba(0,0,0,0.04), inset 0 1.5px 2px 0 rgba(255,255,255,0.9), inset 0 -1px 1px 0 rgba(0,0,0,0.03)",
        "glass-inner":
          "inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.06)",
        "glow-emerald":
          "0 0 28px -2px rgba(45,106,79,0.5), 0 4px 16px rgba(45,106,79,0.25)",
        "liquid-glow":
          "0 10px 30px -5px rgba(52,211,153,0.25), inset 0 1px 1px rgba(255,255,255,0.8)",
        "glass-md": "0 12px 32px rgba(45, 95, 79, 0.15)",
        "glass-lg": "0 20px 48px rgba(45, 95, 79, 0.20)",
        glow: "0 4px 16px rgba(45, 95, 79, 0.08)",
      },
      animation: {
        "glass-in": "glass-slide-up 0.5s ease-out",
        "soft-scale": "soft-scale 0.4s ease-out",
      },
      keyframes: {
        "glass-slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-scale": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
};

export default config;
