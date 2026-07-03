import Hero, { HeroClip } from "@/components/Hero";
import Lookbook, { LookbookPanel } from "@/components/Lookbook";
import ProductGrid, { Product } from "@/components/ProductGrid";
import CraftSection from "@/components/CraftSection";
import Footer from "@/components/Footer";

// PLACEHOLDER DATA — swap for real hero clips, look photography, and
// Supabase-fetched products once assets and DB access are in place.
// Hero videos intentionally point to nothing yet; the Hero component
// falls back to its poster/background color if a src 404s, so the page
// still demonstrates the crossfade + reveal mechanics without breaking.
const heroClips: HeroClip[] = [
  {
    id: "clip-1",
    desktopSrc: "/videos/hero-1-desktop.mp4",
    mobileSrc: "/videos/hero-1-mobile.mp4",
  },
  {
    id: "clip-2",
    desktopSrc: "/videos/hero-2-desktop.mp4",
    mobileSrc: "/videos/hero-2-mobile.mp4",
  },
  {
    id: "clip-3",
    desktopSrc: "/videos/hero-3-desktop.mp4",
    mobileSrc: "/videos/hero-3-mobile.mp4",
  },
];

const lookbookPanels: LookbookPanel[] = [
  { id: "look-1", label: "The Tailored Line", image: "/images/look-1.jpg", href: "/catalog?look=tailored" },
  { id: "look-2", label: "Evening", image: "/images/look-2.jpg", href: "/catalog?look=evening" },
  { id: "look-3", label: "Off-Duty", image: "/images/look-3.jpg", href: "/catalog?look=off-duty" },
];

const newArrivals: Product[] = [
  { id: "p1", name: "Structured Wool Blazer", price: 890, currency: "USD", image: "/images/product-1.jpg", href: "/product/structured-wool-blazer" },
  { id: "p2", name: "Silk Slip Dress", price: 620, currency: "USD", image: "/images/product-2.jpg", href: "/product/silk-slip-dress" },
  { id: "p3", name: "Tailored Wide-Leg Trouser", price: 410, currency: "USD", image: "/images/product-3.jpg", href: "/product/tailored-wide-leg-trouser" },
  { id: "p4", name: "Cashmere Knit Top", price: 340, currency: "USD", image: "/images/product-4.jpg", href: "/product/cashmere-knit-top" },
];

export default function Home() {
  return (
    <main>
      <Hero clips={heroClips} brandName="ARIANA" />

      <Lookbook panels={lookbookPanels} />

      <ProductGrid title="New Arrivals" products={newArrivals} />

      <CraftSection
        image="/images/craft.jpg"
        eyebrow="Craft"
        heading="Every seam considered"
        body="Each piece moves through pattern, fit, and finish with the same
          attention — cut close enough to hold its shape, loose enough to
          move the way you do. Fabric first, decoration last."
      />

      <Footer brandName="ARIANA" />
    </main>
  );
}
