import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "subtle-bg": "hsl(var(--subtle-bg))",
        washmen: {
          primary: "hsl(var(--washmen-primary))",
          "primary-light": "hsl(var(--washmen-primary-light))",
          orange: "hsl(var(--washmen-orange))",
          success: "hsl(var(--washmen-success))",
          warning: "hsl(var(--washmen-warning))",
          error: "hsl(var(--washmen-error))",
          "secondary-50": "hsl(var(--washmen-secondary-50))",
          "secondary-100": "hsl(var(--washmen-secondary-100))",
          "secondary-200": "hsl(var(--washmen-secondary-200))",
          "secondary-300": "hsl(var(--washmen-secondary-300))",
          "secondary-400": "hsl(var(--washmen-secondary-400))",
          "secondary-500": "hsl(var(--washmen-secondary-500))",
          "secondary-600": "hsl(var(--washmen-secondary-600))",
          "secondary-700": "hsl(var(--washmen-secondary-700))",
          "secondary-800": "hsl(var(--washmen-secondary-800))",
          "secondary-900": "hsl(var(--washmen-secondary-900))",
          "secondary-blue": "hsl(var(--washmen-secondary-blue))",
          "secondary-aqua": "hsl(var(--washmen-secondary-aqua))",
          "light-green": "hsl(var(--washmen-light-green))",
          "primary-green": "hsl(var(--washmen-primary-green))",
          "light-pink": "hsl(var(--washmen-light-pink))",
          "pink": "hsl(var(--washmen-pink))",
          "light-grey": "hsl(var(--washmen-light-grey))",
          "secondary-red": "hsl(var(--washmen-secondary-red))",
          "red": "hsl(var(--washmen-red))",
          "aqua-stroke": "hsl(var(--washmen-aqua-stroke))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        sheet: "24px",
        card: "16px",
        btn: "12px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "sheet-in": "sheet-in 240ms cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
