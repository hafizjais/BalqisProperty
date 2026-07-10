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
        // Warm sunset light theme: cream bg, teal + orange accents, brown text
        espresso: "#3E2922", // deep earth brown — headings & body text
        mocha: "#01757A", // teal — navbar, brand surfaces
        teal: "#01757A", // teal — primary buttons, active states
        copper: "#E57734", // orange — CTAs, prices, badges, highlights
        sand: "#F3DCC0", // soft cream-peach — chips, tracks, alt sections
        cream: "#F8EBCF", // cream — page & section backgrounds
        "warm-grey": "#7D6F65", // darkened taupe — secondary text (readable)
        taupe: "#B6ACAD", // muted taupe — borders, placeholders
        peach: "#F6C0A6", // soft peach — card borders, hover accents
        graphite: "#FFFCF5", // warm white — card surfaces
        ink: "#3E2922", // deep brown — footer, dark panels, photo overlays
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(62, 41, 34, 0.1)",
        "card-hover": "0 12px 32px rgba(62, 41, 34, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
