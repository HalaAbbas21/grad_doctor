/** Wrap a CSS-variable color so Tailwind opacity modifiers (e.g. bg-primary/10) work.
 *  Returns the raw var() when no opacity is requested, else a color-mix with transparent. */
function v(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `var(${varName})`
      : `color-mix(in oklab, var(${varName}) calc(${opacityValue} * 100%), transparent)`;
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["Tajawal", "Nunito", "system-ui", "sans-serif"],
        body: ["Nunito", "Tajawal", "system-ui", "sans-serif"],
        display: ["Quicksand", "Tajawal", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "system-ui", "sans-serif"],
      },
      colors: {
        background: v("--background"),
        foreground: v("--foreground"),
        border: v("--border"),
        input: v("--input"),
        ring: v("--ring"),
        card: { DEFAULT: v("--card"), foreground: v("--card-foreground") },
        popover: { DEFAULT: v("--popover"), foreground: v("--popover-foreground") },
        primary: {
          DEFAULT: v("--primary"),
          foreground: v("--primary-foreground"),
          soft: v("--primary-soft"),
        },
        secondary: {
          DEFAULT: v("--secondary"),
          foreground: v("--secondary-foreground"),
          soft: v("--secondary-soft"),
        },
        accent: {
          DEFAULT: v("--accent"),
          foreground: v("--accent-foreground"),
          soft: v("--accent-soft"),
        },
        highlight: {
          DEFAULT: v("--highlight"),
          foreground: v("--highlight-foreground"),
          soft: v("--highlight-soft"),
        },
        muted: { DEFAULT: v("--muted"), foreground: v("--muted-foreground") },
        destructive: { DEFAULT: v("--destructive"), foreground: v("--destructive-foreground") },
        success: { DEFAULT: v("--success"), foreground: v("--success-foreground") },
        warning: { DEFAULT: v("--warning"), foreground: v("--warning-foreground") },
      },
      borderRadius: {
        sm: "0.75rem",
        md: "0.875rem",
        lg: "var(--radius)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #008FD2, #B25EC5, #51C672)",
        sun: "linear-gradient(135deg, #FACB39, #F5C06A)",
        hope: "linear-gradient(135deg, #51C672, #008FD2)",
        care: "linear-gradient(135deg, #B25EC5, #008FD2)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
