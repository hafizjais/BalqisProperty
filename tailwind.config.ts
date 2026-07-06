import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark luxe theme: charcoal bg, soft white text, gold + steel accents
        espresso: "#F4F3EF", // soft white — headings & body text
        mocha: "#2E3138", // brushed steel — navbar, dark surfaces
        copper: "#D4AF37", // gold — CTAs, badges, highlights
        sand: "#26272D", // elevated surface / alternate sections
        cream: "#1B1C20", // charcoal — page background
        "warm-grey": "#A7ABB3", // steel grey — secondary text
        graphite: "#222329", // card surfaces
        ink: "#121316", // deepest panels, text on gold
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 28px rgba(0, 0, 0, 0.45)",
        "card-hover": "0 14px 40px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
