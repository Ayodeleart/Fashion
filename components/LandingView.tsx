import type { HeroBanner } from "@/components/Hero";
import type { LookbookPanel } from "@/components/Lookbook";
import type { Product } from "@/components/ProductGrid";
import { CartProvider } from "@/components/CartProvider";
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
  return (
    <CartProvider>
      <main className="bg-paper">
        <LandingHeader />
        <LandingHero desktopBanner={desktopBanners[0] ?? null} mobileBanner={mobileBanners[0] ?? null} />
        <GiftedHandsSection panels={lookbookPanels} />
        <SkillsSection />
        <CreationsSection products={newArrivals} />
        <ArtSection section={artSection ?? null} />
        <TestimonialsSection />
        <LandingFooter />
      </main>
    </CartProvider>
  );
}
