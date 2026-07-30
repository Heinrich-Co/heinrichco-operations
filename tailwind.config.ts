import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#1B1D1E",
        coal: "#161819",
        ink: "#26292A",
        offwhite: "#F2F2F2",
        paper: "#FBFBFA",
        white: "#FFFFFF",
        green: "#CAD3AC",
        "green-d": "#A9B589",
        "green-dd": "#8E9C6E",
        beige: "#C1B9AD",
        "beige-l": "#E3DED6",
        "gray-l": "#908A82",
        "gray-m": "#6F6B65",
        "gray-d": "#4F4C49",
        brick: "#B04A3E",
        amber: "#B8863B",
        // chip tints from prototype
        "chip-pending-bg": "#F4E9D2",
        "chip-pending-fg": "#7A5A1E",
        "chip-overdue-bg": "#F0D9D5",
        "chip-overdue-fg": "#7E2E23",
      },
      fontFamily: {
        sans: ['"Work Sans"', "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.12em",
      },
      keyframes: {
        slideIn: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "none" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(9px)" },
          to: { opacity: "1", transform: "none" },
        },
        kpiIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        slideIn: "slideIn .25s ease",
        fadeUp: "fadeUp .30s ease",
        kpiIn: "kpiIn .42s ease forwards",
        spin: "spin .8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
