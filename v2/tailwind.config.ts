import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        vv: "var(--vv-radius)",
      },
      colors: {
        vv: {
          bg: "var(--vv-bg)",
          panel: "var(--vv-panel)",
          card: "var(--vv-card)",
          text: "var(--vv-text)",
          border: "var(--vv-border)",
          divider: "var(--vv-divider)",
          cyan: "var(--vv-cyan)",
          violet: "var(--vv-violet)",
          success: "var(--vv-success)",
          warning: "var(--vv-warning)",
          danger: "var(--vv-danger)",
        },
        // shadcn/ui HSL token compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
