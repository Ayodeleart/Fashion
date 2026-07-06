import { createAdminClient } from "@/lib/supabase-admin";

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

export default async function AuthBackground({ children }: { children: React.ReactNode }) {
  const background = await getBackground();

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
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      <div className={`relative z-10 w-full ${background ? "max-w-sm mx-auto" : ""}`}>
        {background ? (
          <div className="bg-paper/95 rounded-3xl px-6 py-8 backdrop-blur-sm">{children}</div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
