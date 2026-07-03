import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <form action={login} className="w-full max-w-sm">
        <p className="font-display text-2xl text-paper mb-1">AYODELE<span className="text-brass">GOLD</span></p>
        <p className="text-sm text-paper/50 mb-8">Admin sign in</p>

        <input type="hidden" name="from" value={from ?? "/admin"} />

        {error === "invalid" && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded p-3 mb-5">
            Incorrect username or password.
          </p>
        )}
        {error === "config" && (
          <p className="text-sm text-amber-300 bg-amber-950/40 border border-amber-900 rounded p-3 mb-5">
            Admin credentials aren&apos;t configured yet — set ADMIN_USERNAME, ADMIN_PASSWORD, and
            ADMIN_SESSION_SECRET in your environment.
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm text-paper/70 mb-1">Username</label>
          <input
            name="username"
            required
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full border border-paper/20 bg-transparent text-paper rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-paper/70 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border border-paper/20 bg-transparent text-paper rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-brass text-ink text-sm py-2.5 rounded hover:opacity-90 transition-opacity"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
