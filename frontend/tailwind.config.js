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
          contrast: "var(--dm-accent-contrast)",
        },
        citation: {
          DEFAULT: "var(--dm-citation-bg)",
          border: "var(--dm-citation-border)",
          text: "var(--dm-citation-text)",
          hover: "var(--dm-citation-hover)",
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
        serif: ["Source Serif 4", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        prose: "70ch",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)",
        floating: "0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
