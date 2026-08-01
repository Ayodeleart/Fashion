import type { HeroBanner } from "@/components/Hero";
import type { LookbookPanel } from "@/components/Lookbook";
import type { Product } from "@/components/ProductGrid";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import GiftedHandsSection from "@/components/landing/GiftedHandsSection";
import SkillsSection from "@/components/landing/SkillsSection";
import CreationsSection from "@/components/landing/CreationsSection";
import ArtSection from "@/components/landing/ArtSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import LandingFooter from "@/components/landing/LandingFooter";

type ArtSectionData = { image_url: string | null; quote_top: string; quote_bottom: string } | null;

export default function LandingView({
  desktopBanners,
  mobileBanners,
  lookbookPanels,
  newArrivals,
  artSection,
}: {
  desktopBanners: HeroBanner[];
  mobileBanners: HeroBanner[];
  lookbookPanels: LookbookPanel[];
  newArrivals: Product[];
  artSection?: ArtSectionData;
}) {
  // The hero is a single photo in this design (not the old carousel) —
  // mobile banner preferred since this page is mobile-first, falling
  // back to the first desktop banner if that's all that's set.
  const heroBanner = mobileBanners[0] ?? desktopBanners[0] ?? null;

  return (
    <main className="bg-paper">
      <LandingHeader />
      <LandingHero banner={heroBanner} />
      <GiftedHandsSection panels={lookbookPanels} />
      <SkillsSection />
      <CreationsSection products={newArrivals} />
      <ArtSection section={artSection ?? null} />
      <TestimonialsSection />
      <LandingFooter />
    </main>
  );
}
