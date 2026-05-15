import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081014",
        panel: "#10191f",
        panel2: "#142229",
        line: "#20323b",
        signal: "#39ffb6",
        warn: "#ffcc66",
        danger: "#ff5c7a"
      },
      fontFamily: {
        sans: ["Inter", "Geist", "Arial", "sans-serif"],
        mono: ["Geist Mono", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
