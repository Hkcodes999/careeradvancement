/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#0f172a", // slate-900
          DEFAULT: "#0f172a",
        },
        accent: {
          blue: "#2563eb",
          purple: "#7c3aed",
          amber: "#f59e0b",
        },
        text: {
          main: "#1e293b",
          muted: "#64748b",
        },
        bg: {
          light: "#f8fafc",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
      },
      animation: {
        "gradient-shift": "gradientShift 6s ease infinite",
        blob: "blob 8s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "rotate-clockwise": "rotateClockwise 30s linear infinite",
        "rotate-counter-clockwise":
          "rotateCounterClockwise 50s linear infinite",
        "status-pulse": "statusPulse 2s infinite",
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blob: {
          "0%, 100%": { borderRadius: "35% 65% 65% 35% / 30% 30% 70% 70%" },
          "50%": { borderRadius: "50% 50% 30% 70% / 50% 60% 40% 50%" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow:
              "0 15px 35px rgba(15, 23, 42, 0.08), 0 0 15px rgba(251, 113, 133, 0.1)",
          },
          "50%": {
            boxShadow:
              "0 15px 35px rgba(15, 23, 42, 0.08), 0 0 30px rgba(251, 191, 36, 0.2)",
          },
        },
        rotateClockwise: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        rotateCounterClockwise: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },
        statusPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
