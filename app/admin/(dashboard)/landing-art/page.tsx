import { createAdminClient } from "@/lib/supabase-admin";
import LandingArtForm from "@/components/admin/LandingArtForm";

export const dynamic = "force-dynamic";

async function getSection() {
  const admin = createAdminClient();
  const { data } = await admin.from("ariana_landing_art_section").select("*").eq("id", 1).maybeSingle();
  return data;
}

export default async function LandingArtAdminPage() {
  const section = await getSection();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-2">Landing: &ldquo;Fashion Becomes Art&rdquo;</h1>
      <p className="text-sm text-muted mb-6">
        The portrait photo and circular text in the dark section of the landing page, between Our
        Creations and Testimonials.
      </p>
      <LandingArtForm initial={section} />
    </div>
  );
}
