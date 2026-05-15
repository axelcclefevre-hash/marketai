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
        bg:       "#0a0a0a",
        surface:  "#111111",
        surface2: "#1a1a1a",
        border:   "rgba(255,255,255,0.08)",
        primary:  "#f5f5f5",
        muted:    "#6b7280",
        buy:      "#00d97e",
        sell:     "#ff4757",
        hold:     "#ffd32a",
      },
      fontFamily: {
        sans:  ["var(--font-geist-sans)", "Helvetica Neue", "sans-serif"],
        mono:  ["var(--font-geist-mono)", "monospace"],
        serif: ["Newsreader", "Georgia", "serif"],
      },
      animation: {
        blink: "blink 2.4s infinite",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        blink: {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.2" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
