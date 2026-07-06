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
        espresso: "#2C1F14",
        mocha: "#7C6248",
        copper: "#C4784B",
        sand: "#EDE5DA",
        cream: "#FAF7F2",
        "warm-grey": "#8A7968",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(44, 31, 20, 0.08)",
        "card-hover": "0 10px 32px rgba(44, 31, 20, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
