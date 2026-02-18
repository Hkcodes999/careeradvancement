/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6B9080", // Sage - Primary Brand
          hover: "#557265",
          light: "#82A394",
        },
        secondary: "#A4C3B2", // Light Sage
        accent: "#CCE3DE", // Mint
        light: "#EAF4F4", // Light Mint (Section BGs)
        surface: "#F6FFF8", // Off-White (Main BG)
        navy: {
          // Keep for backward compat, mapped to dark sage/slate
          900: "#2C423B", // Very Dark Sage - Text/Headings
          800: "#3A554C",
          700: "#49695E",
        },
        platinum: "#EAF4F4", // Mapped to Light Mint
        dark: "#1A2824", // Almost Black Sage
        white: "#FFFFFF",
        text: {
          main: "#2C423B", // Dark Sage
          muted: "#5C756D", // Muted Sage
          light: "#8DA399",
          inverted: "#FFFFFF",
        },
        bg: {
          light: "#EAF4F4",
          white: "#FFFFFF",
          navy: "#2C423B", // Dark Sage
          surface: "#F6FFF8",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      backgroundImage: {
        "sage-gradient": "linear-gradient(135deg, #6B9080 0%, #A4C3B2 100%)",
        "mint-gradient": "linear-gradient(135deg, #CCE3DE 0%, #EAF4F4 100%)",
        "soft-gradient": "linear-gradient(180deg, #F6FFF8 0%, #EAF4F4 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        blob: "blob 7s infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "soft-xl": "0 20px 40px -10px rgba(0, 0, 0, 0.05)",
        "soft-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
    },
  },
  plugins: [],
};
