import { createAdminClient } from "@/lib/supabase-admin";
import LoginBackgroundUploadForm from "@/components/admin/LoginBackgroundUploadForm";

export const dynamic = "force-dynamic";

async function getCurrentBackground(): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_login_background")
    .select("image_url")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.image_url ?? null;
}

export default async function AdminLoginBackgroundPage() {
  const current = await getCurrentBackground();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Login Background</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        One shared background image for the sign in and sign up pages — used on both desktop and
        mobile. Uploading a new one replaces the current one.
      </p>

      {current && (
        <div className="mb-8">
          <p className="text-sm mb-2">Current</p>
          <div className="w-64 h-40 rounded-lg overflow-hidden border border-ink/10 bg-paper-raised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt="Current login background" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <LoginBackgroundUploadForm />
    </div>
  );
}
