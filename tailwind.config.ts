import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        newspaper: {
          bg: "#faf9f6",
          text: "#1a1a1a",
          muted: "#6b6b6b",
          border: "#e5e5e5",
          accent: "#0066cc",
        },
      },
    },
  },
  plugins: [],
};

export default config;
