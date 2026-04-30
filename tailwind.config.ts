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
          // Primary
          primary: "hsl(var(--washmen-primary))",
          "primary-aqua": "hsl(var(--washmen-primary-aqua))",
          "primary-green": "hsl(var(--washmen-primary-green))",
          "primary-orange": "hsl(var(--washmen-primary-orange))",
          "primary-pink": "hsl(var(--washmen-primary-pink))",
          "primary-red": "hsl(var(--washmen-primary-red))",
          "primary-teal": "hsl(var(--washmen-primary-teal))",
          "notification-red": "hsl(var(--washmen-notification-red))",

          // Light / secondary variants
          "light-blue": "hsl(var(--washmen-light-blue))",
          "light-aqua": "hsl(var(--washmen-light-aqua))",
          "light-green": "hsl(var(--washmen-light-green))",
          "light-orange": "hsl(var(--washmen-light-orange))",
          "light-pink": "hsl(var(--washmen-light-pink))",
          "light-red": "hsl(var(--washmen-light-red))",
          "light-teal": "hsl(var(--washmen-light-teal))",

          // Greys
          "slate-grey": "hsl(var(--washmen-slate-grey))",
          "cloudy-blue": "hsl(var(--washmen-cloudy-blue))",
          "light-grey": "hsl(var(--washmen-light-grey))",
          "pale-grey": "hsl(var(--washmen-pale-grey))",
          bg: "hsl(var(--washmen-bg))",

          // Function colors
          discount: "hsl(var(--washmen-discount))",
          "info-toast": "hsl(var(--washmen-info-toast))",
          "express-delivery": "hsl(var(--washmen-express-delivery))",
          "secondary-express": "hsl(var(--washmen-secondary-express))",

          // === Deprecated aliases ===
          // HANDOFF: kept so existing usages don't break during Phase 2 of
          // the color migration. Remove once all usages are migrated to the
          // canonical names above.
          "primary-light": "hsl(var(--washmen-primary-light))", // deprecated → light-blue
          orange: "hsl(var(--washmen-primary-orange))",         // deprecated → primary-orange
          pink: "hsl(var(--washmen-primary-pink))",             // deprecated → primary-pink
          red: "hsl(var(--washmen-primary-red))",               // deprecated → primary-red
          "secondary-blue": "hsl(var(--washmen-light-blue))",   // deprecated → light-blue
          "secondary-aqua": "hsl(var(--washmen-light-aqua))",   // deprecated → light-aqua
          "secondary-red": "hsl(var(--washmen-light-red))",     // deprecated → light-red

          // === Pre-design-system neutral ladder (deprecated, kept for compat) ===
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

          // Misc remaining (audit usage and migrate if possible)
          success: "hsl(var(--washmen-success))",
          warning: "hsl(var(--washmen-warning))",
          error: "hsl(var(--washmen-error))",
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
        card: "8px",
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
