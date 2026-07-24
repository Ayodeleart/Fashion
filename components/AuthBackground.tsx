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
    <main className="relative min-h-screen flex flex-col justify-center px-6 py-16 overflow-hidden">
      {background && (
        <>
          {/* Same image, same treatment, at any width — deliberately not
              swapped or cropped differently between mobile and desktop. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={background}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/35" />
        </>
      )}

      <div className={`relative z-10 w-full ${background ? "max-w-sm mx-auto" : ""}`}>
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
