import { createAdminClient } from "@/lib/supabase-admin";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

async function getBackground(): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_login_background")
    .select("image_url")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.image_url ?? null;
}

export default async function AuthBackground({ mode }: { mode: "login" | "signup" }) {
  const background = await getBackground();
  const title = mode === "signup" ? "Create your account" : "Welcome back";
  const subtitle = mode === "signup" ? "Shop faster, save favorites, track orders" : "Sign in to continue";

  return (
    <main className="relative h-[100dvh] overflow-hidden flex flex-col justify-center px-6 py-10">
      {background && (
        <>
          {/* Same image, same treatment, at any width — deliberately not
              swapped or cropped differently between mobile and desktop.
              fixed (not absolute) so it's pinned to the viewport and never
              scrolls with the page — this whole page has no scroll at all. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={background}
            alt=""
            className="fixed inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          {/* A vignette rather than a flat tint — keeps real contrast right
              behind the card for backdrop-filter to actually refract, and
              only darkens toward the edges where there's no text to read. */}
          <div
            className="fixed inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.5) 100%)",
            }}
          />
        </>
      )}

      <div className={`relative z-10 w-full max-h-full overflow-y-auto no-scrollbar ${background ? "max-w-sm mx-auto" : ""}`}>
        {background ? (
          <div className="liquid-glass rounded-[32px] px-6 py-8">
            <h1 className="font-display text-3xl mb-1 text-center text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              {title}
            </h1>
            <p className="text-sm text-white/80 text-center mb-8">{subtitle}</p>
            <Suspense fallback={null}>
              <AuthForm mode={mode} glass />
            </Suspense>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl mb-1 text-center">{title}</h1>
            <p className="text-sm text-muted text-center mb-8">{subtitle}</p>
            <Suspense fallback={null}>
              <AuthForm mode={mode} />
            </Suspense>
          </>
        )}
      </div>
    </main>
  );
}
