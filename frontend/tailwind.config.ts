import type { Config } from "tailwindcss";

// Tokens = variables CSS (app/globals.css) → un seul endroit pour changer le thème.
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        deep: c("deep"), bg: c("bg"), surface: c("surface"), surface2: c("surface2"),
        primary: c("primary"), secondary: c("secondary"), muted: c("muted"),
        buy: c("buy"), sell: c("sell"), hold: c("hold"),
        border: "rgb(237 237 237 / 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: { "fade-up": "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both" },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
      },
    },
  },
  plugins: [],
};
export default config;
