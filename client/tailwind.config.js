/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00A8E8", // Light Cyan
          hover: "#007EA7",
          light: "#E0F7FA",
        },
        secondary: "#007EA7", // Cerulean
        accent: "#00A8E8", // Match primary for accents
        light: "#F0F2F5", // Light mode cards
        surface: "#F8FAFC", // Main BG in Light Mode
        navy: {
          900: "#00171F",
          800: "#003459",
          700: "#007EA7",
        },
        platinum: "#334155",
        dark: "#000000",
        white: "#FFFFFF",
        text: {
          main: "#00171F",
          muted: "#4B5563",
          light: "#9CA3AF",
          inverted: "#F8FAFC",
        },
        bg: {
          light: "#F0F2F5",
          white: "#ffffff",
          navy: "#00171F",
          surface: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #00A8E8 0%, #007EA7 100%)",
        "mesh-gradient":
          "radial-gradient(at 40% 20%, hsla(263,73%,38%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(234,73%,48%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(189,73%,48%,0.1) 0px, transparent 50%)",
        "glass-gradient":
          "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        blob: "blob 7s infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out both",
        "fade-in-left": "fadeInLeft 0.8s ease-out both",
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
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
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
