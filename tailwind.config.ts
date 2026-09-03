import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#2D5F4F",
        beige: "#D4C5B0",
        gold: "#FFB347",
        slate: "#7A8FA3",
        cream: "#F5F1E8",
      },
      boxShadow: {
        glass: "0 8px 24px rgba(45, 95, 79, 0.12)",
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
