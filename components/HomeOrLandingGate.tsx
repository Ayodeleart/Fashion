"use client";

import { useEffect, useState } from "react";
import { isStandalone } from "@/lib/pwa-standalone";
import HomeView from "@/components/HomeView";
import LandingView from "@/components/LandingView";
import type { EditorialHeroLook } from "@/components/home/EditorialHero";
import type { FeedLook } from "@/components/home/HomeFeed";
import type { HeroBanner } from "@/components/Hero";
import type { LookbookPanel } from "@/components/Lookbook";
import type { Product } from "@/components/ProductGrid";
import type { ReelPreview } from "@/components/ReelsPreviewGrid";

export default function HomeOrLandingGate({
  heroLooks,
  looks,
  desktopBanners,
  mobileBanners,
  lookbookPanels,
  newArrivals,
  reelsPreview,
}: {
  heroLooks: EditorialHeroLook[];
  looks: FeedLook[];
  desktopBanners: HeroBanner[];
  mobileBanners: HeroBanner[];
  lookbookPanels: LookbookPanel[];
  newArrivals: Product[];
  reelsPreview: ReelPreview[];
}) {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Reading an external media-query/navigator flag on mount — not
    // something a lazy useState initializer can do without risking a
    // server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isStandalone());
    setReady(true);
  }, []);

  // Avoid a flash of the wrong page — this check is fast and client-only,
  // same pattern as InstallGate.
  if (!ready) return null;

  // Installed (Add to Home Screen, standalone display mode) → the real
  // app: editorial Pinterest-style Home, bottom nav, the works.
  // Plain browser tab → the marketing landing page, no app chrome at all.
  // StorefrontChrome makes the matching decision for the bottom nav/
  // providers — see isHomePath there.
  if (installed) return <HomeView heroLooks={heroLooks} looks={looks} newArrivals={newArrivals} reelsPreview={reelsPreview} />;

  return (
    <LandingView
      desktopBanners={desktopBanners}
      mobileBanners={mobileBanners}
      lookbookPanels={lookbookPanels}
      newArrivals={newArrivals}
    />
  );
}
