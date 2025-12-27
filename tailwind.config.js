/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./marketing/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#51CEE5", // Keep brand cyan
          secondary: "#576BA8",
          mint: "#34D399",
          spark: "#FFC857",
        },

        // Legacy App Tokens (Keep for globals.css compatibility)
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-muted": "hsl(var(--surface-muted) / <alpha-value>)",
        text: "hsl(var(--text) / <alpha-value>)",
        "text-muted": "hsl(var(--text-muted) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        "danger-soft": "hsl(var(--danger-soft) / <alpha-value>)",
        outline: "hsl(var(--outline) / <alpha-value>)",
        focus: "hsl(var(--focus) / <alpha-value>)",

        // Candy UI Tokens
        candy: {
          yellow: "#FCD34D", // Amber-300
          yellowDeep: "#D97706", // Amber-600
          blue: "#38BDF8", // Sky-400
          blueDeep: "#0284C7", // Sky-600
          green: "#34D399", // Emerald-400
          greenDeep: "#059669", // Emerald-600
          red: "#FB7185", // Rose-400
          redDeep: "#E11D48", // Rose-600
          purple: "#A78BFA",
          purpleDeep: "#7C3AED",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
      },
      boxShadow: {
        // Legacy Shadows
        soft: "0 10px 30px rgba(2, 6, 23, 0.08)",
        elevated: "0 18px 55px rgba(2, 6, 23, 0.12)",
        glow: "0 0 0 1px rgba(79,70,229,0.12), 0 18px 55px rgba(2,6,23,0.10)",
        e1: "0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)",
        e2: "0 6px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
        e3: "0 18px 50px rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.10)",

        // 3D Button Shadows
        "3d-sm": "0 2px 0 0 rgba(0,0,0,0.15)",
        "3d-md": "0 4px 0 0 rgba(0,0,0,0.15)",
        "3d-lg": "0 6px 0 0 rgba(0,0,0,0.15)",
      },
      borderRadius: {
        "4xl": "2.5rem",
        "pill": "9999px",
        "card": "2rem",
      },
    },
  },
  plugins: [],
};
