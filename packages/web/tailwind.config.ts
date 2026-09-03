import type { Config } from "tailwindcss";

const config: Config = {
  // Keeps hover styles off touch devices, where a tapped chip would otherwise
  // hold its hover look and read as half-selected.
  future: { hoverOnlyWhenSupported: true },
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-hanken)", "var(--font-nunito)", "sans-serif"],
      },
      colors: {
        // Warm canvas
        cream: "#FFF6EC",
        shell: "#FFEFDD",
        soft: "#5C5570",
        // Brand orange — deep enough that white text clears contrast
        carrot: {
          DEFAULT: "#F2640F",
          dark: "#D9560B",
          deep: "#B8480A",
        },
        // Playful accents
        sun: "#FFC53D",
        blush: "#FF8FA3",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 18px 40px -24px rgba(39, 35, 58, 0.35)",
        raise: "0 21px 45px -26px rgba(39, 35, 58, 0.4)",
        lift: "0 24px 50px -28px rgba(39, 35, 58, 0.45)",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.165, 0.84, 0.44, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
