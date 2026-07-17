import Link from "next/link";

export default function LookNotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs tracking-[0.15em] uppercase text-muted mb-3">Style not found</p>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-3">
        This look isn't available anymore
      </h1>
      <p className="text-sm text-ink/70 max-w-sm mb-8">
        It may have been removed or the link is out of date. Have a look at what's currently in the edit.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors"
      >
        Back to Home
      </Link>
    </main>
  );
}
