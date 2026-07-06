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
        // MP072 palette: deep navy bg, palladian text, burning-flame accents
        // Layering scale (dark → light): ink → cream (page) → sand → graphite → mocha
        espresso: "#EEE9DF", // Palladian — headings & body text
        mocha: "#3A4C63", // lightened Blue Fantastic — navbar, lightest surfaces
        copper: "#FFB162", // Burning Flame — CTAs, badges, highlights
        sand: "#223140", // elevated section backgrounds, tracks, chips
        cream: "#1B2632", // Abyssal Anchorfish Blue — page background
        "warm-grey": "#C9C1B1", // Oatmeal — secondary text
        graphite: "#2C3B4D", // Blue Fantastic — card surfaces
        ink: "#131B25", // deepest panels, text on flame
        truffle: "#A35139", // Truffle Trouble — warm secondary accent
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
