import { resolveTheme } from "@/lib/theme";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const theme = await resolveTheme();

  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Settings</h1>

      <div className="bg-paper-raised rounded-2xl divide-y divide-ink/5">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm">Appearance</p>
            <p className="text-xs text-muted">Light or dark theme for the shop</p>
          </div>
          <ThemeToggle current={theme} />
        </div>
      </div>
    </main>
  );
}
