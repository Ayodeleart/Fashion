import type { Config } from "tailwindcss";

// RGB-triplet + <alpha-value> pattern: lets Tailwind's opacity modifiers
// (bg-ink/10, text-paper/60, etc.) work correctly against CSS custom
// properties. This is the standard v3 approach — v4 handled this
// automatically, v3 needs the values pre-formatted like this.
function withOpacity(varName: string) {
  return `rgb(var(${varName}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: withOpacity("--ink"),
        paper: withOpacity("--paper"),
        "paper-raised": withOpacity("--paper-raised"),
        brass: withOpacity("--brass"),
        muted: withOpacity("--muted"),
      },
      fontFamily: {
        display: ["var(--font-clash)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-general)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
