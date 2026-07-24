import AccountShell from "@/components/AccountShell";

export default function LanguagePage() {
  const languages = ["English", "Français", "Español", "Yorùbá"];
  return (
    <AccountShell>
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Language</h1>
      <div className="liquid-glass-light rounded-2xl divide-y divide-ink/5">
        {languages.map((lang, i) => (
          <div key={lang} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm">{lang}</span>
            {i === 0 && <span className="text-xs text-ink">✓</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-4">More languages are coming soon.</p>
    </main>
  </AccountShell>
  );
}
