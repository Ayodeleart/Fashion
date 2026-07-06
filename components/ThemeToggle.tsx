"use client";

import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme-shared";

export default function ThemeToggle({ current }: { current: Theme }) {
  function setTheme(theme: Theme) {
    document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }));
  }

  return (
    <div className="flex items-center gap-2">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
            current === t ? "bg-ink text-paper border-ink" : "border-ink/20 text-muted hover:border-ink/40"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
