import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import StyleActions from "@/components/StyleActions";

export const dynamic = "force-dynamic";

type PanelRow = {
  id: string;
  label: string;
  image_url: string;
  href: string;
  story: string | null;
  category: string | null;
};

async function getStyle(id: string): Promise<PanelRow | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, href, story, category")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

async function getSimilarStyles(category: string | null, excludeId: string): Promise<PanelRow[]> {
  if (!category) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, href, story, category")
    .eq("category", category)
    .neq("id", excludeId)
    .order("position", { ascending: true })
    .limit(8);
  return data ?? [];
}

export default async function StylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const style = await getStyle(id);
  if (!style) notFound();

  const similar = await getSimilarStyles(style.category, style.id);

  return (
    <main className="pb-12">
      <div className="relative h-[70vh] w-full">
        <Image src={style.image_url} alt={style.label} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        <Link
          href="/"
          aria-label="Back"
          className="absolute top-5 left-5 w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-3xl md:text-4xl text-paper leading-tight">{style.label}</h1>
        </div>
      </div>

      <div className="px-6 pt-6 max-w-2xl mx-auto">
        {style.story && <p className="text-sm text-muted leading-relaxed mb-6">{style.story}</p>}

        <StyleActions id={style.id} label={style.label} image={style.image_url} href={style.href} />
      </div>

      {similar.length > 0 && (
        <div className="mt-14 px-6 max-w-4xl mx-auto">
          <p className="eyebrow mb-4">Similar styles</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similar.map((s) => (
              <Link key={s.id} href={`/style/${s.id}`} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper-raised block">
                <Image src={s.image_url} alt={s.label} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
