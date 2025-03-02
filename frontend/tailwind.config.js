/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "hero-pattern": "url('/images/background.png')",
      },
      fontFamily: {
        "press-start": ["Press Start 2P", "sans-serif"],
      },
      colors: {
        green: "#31E78B",
        black: "#08090D",
        gray: "#D4D4D8",
        white: "#FFFFFF",
        red: "#EA242D",
        "left-gradient-p": "rgba(36,36,36,0.4)",
        "right-gradient-p": "rgba(36,36,36,0.2)",
        "left-gradient-s": "rgba(80,80,80,0.4)",
        "right-gradient-s": "rgba(80,80,80,0.2)",
        "logout-bg": "rgba(255, 0, 0, 0.2)",
        "stroke-pr": "#313131",
        "stroke-sc": "#5B5B5B",
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
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        "txt-xs": "0.75rem",
        "txt-sm": "0.875rem",
        "txt-md": "1rem",
        "txt-lg": "1.125rem",
        "txt-xl": "1.25rem",
        "txt-2xl": "1.5rem",
        "txt-3xl": "1.875rem",
        "txt-4xl": "2.25rem",
        "txt-5xl": "3rem",
        "txt-6xl": "3.75rem",
        "h-lg-xs": "0.875rem",
        "h-lg-sm": "1rem",
        "h-lg-md": "1.25rem",
        "h-lg-lg": "1.875rem",
        "h-lg-xl": "2.25rem",
        "h-lg-2xl": "3rem",
        "h-lg-3xl": "3.75rem",
        "h-lg-4xl": "4.5rem",
        "h-sm-xs": "0.875rem",
        "h-sm-sm": "1rem",
        "h-sm-md": "1.25rem",
        "h-sm-lg": "1.5rem",
        "h-sm-xl": "1.875rem",
        "h-sm-2xl": "2.25rem",
        "h-sm-3xl": "3rem",
        "h-sm-4xl": "3.75rem",
      },
      spacing: {
        2: "0.124rem",
        3: "0.1875rem",
        4: "0.25rem",
        8: "0.5rem",
        10: "0.625rem",
        12: "0.75rem",
        16: "1rem",
        22: "1.375rem",
        24: "1.5rem",
        32: "2rem",
        40: "2.5rem",
        48: "3rem",
        56: "3.5rem",
        64: "4rem",
      },
      lineHeight: {
        2: "0.124rem",
        3: "0.1875rem",
        4: "0.25rem",
        8: "0.5rem",
        10: "0.625rem",
        12: "0.75rem",
        16: "1rem",
        22: "1.375rem",
        24: "1.5rem",
        32: "2rem",
        40: "2.5rem",
        48: "3rem",
        56: "3.5rem",
        64: "4rem",
      },
      screens: {
        lg: "1100px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
