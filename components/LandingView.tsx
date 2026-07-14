import Hero, { HeroBanner } from "@/components/Hero";
import Lookbook, { LookbookPanel } from "@/components/Lookbook";
import ProductGrid, { Product } from "@/components/ProductGrid";
import Footer from "@/components/Footer";

export default function LandingView({
  desktopBanners,
  mobileBanners,
  lookbookPanels,
  newArrivals,
}: {
  desktopBanners: HeroBanner[];
  mobileBanners: HeroBanner[];
  lookbookPanels: LookbookPanel[];
  newArrivals: Product[];
}) {
  return (
    <main>
      <Hero desktopBanners={desktopBanners} mobileBanners={mobileBanners} />

      <Lookbook panels={lookbookPanels} />

      <ProductGrid title="New Arrivals" products={newArrivals} />

      <Footer brandName="AyodeleGold" />
    </main>
  );
}
