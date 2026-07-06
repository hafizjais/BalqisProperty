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
        // Layering scale (dark → light): ink → cream (page) → sand → graphite → mocha
        espresso: "#F4F3EF", // soft white — headings & body text
        mocha: "#343841", // brushed steel — navbar, lightest surfaces
        copper: "#D4AF37", // gold — CTAs, badges, highlights
        sand: "#262830", // elevated section backgrounds, tracks, chips
        cream: "#17181C", // charcoal — page background
        "warm-grey": "#ACB0B8", // steel grey — secondary text
        graphite: "#2B2D35", // card surfaces — clearly lighter than the page
        ink: "#101114", // deepest panels, text on gold
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
