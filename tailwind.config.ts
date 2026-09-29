import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#07080c",
          900: "#0b0d14",
          800: "#121520",
          700: "#1a1f2e",
          600: "#252c40",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15), transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
