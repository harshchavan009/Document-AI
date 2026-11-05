/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: "var(--dm-bg-canvas)",
        surface: {
          DEFAULT: "var(--dm-bg-surface)",
          subtle: "var(--dm-bg-surface-subtle)",
          elevated: "var(--dm-bg-surface-elevated)",
          hover: "var(--dm-bg-hover)",
          active: "var(--dm-bg-active)",
        },
        content: {
          primary: "var(--dm-text-primary)",
          secondary: "var(--dm-text-secondary)",
          muted: "var(--dm-text-muted)",
          disabled: "var(--dm-text-disabled)",
          inverse: "var(--dm-text-inverse)",
        },
        border: {
          DEFAULT: "var(--dm-border-default)",
          subtle: "var(--dm-border-subtle)",
          strong: "var(--dm-border-strong)",
          focus: "var(--dm-border-focus)",
        },
        accent: {
          DEFAULT: "var(--dm-accent)",
          hover: "var(--dm-accent-hover)",
          subtle: "var(--dm-accent-subtle)",
          text: "var(--dm-accent-text)",
        },
        semantic: {
          success: {
            bg: "var(--dm-success-bg)",
            border: "var(--dm-success-border)",
            text: "var(--dm-success-text)",
          },
          warning: {
            bg: "var(--dm-warning-bg)",
            border: "var(--dm-warning-border)",
            text: "var(--dm-warning-text)",
          },
          error: {
            bg: "var(--dm-error-bg)",
            border: "var(--dm-error-border)",
            text: "var(--dm-error-text)",
          },
          info: {
            bg: "var(--dm-info-bg)",
            border: "var(--dm-info-border)",
            text: "var(--dm-info-text)",
          },
        },
        evidence: {
          bg: "var(--dm-evidence-bg)",
          border: "var(--dm-evidence-border)",
          highlight: "var(--dm-evidence-highlight)",
          text: "var(--dm-evidence-text)",
        },
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
