"use client";

import { useState } from "react";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import EditorialHero, { type EditorialHeroLook } from "@/components/home/EditorialHero";
import HomeFeed, { type FeedLook } from "@/components/home/HomeFeed";
import ProductGrid, { type Product } from "@/components/ProductGrid";
import ReelsPreviewGrid, { type ReelPreview } from "@/components/ReelsPreviewGrid";
import TopNav, { type HomeTab } from "@/components/TopNav";

export default function HomeView({
  heroLooks,
  looks,
  newArrivals,
  reelsPreview,
}: {
  heroLooks: EditorialHeroLook[];
  looks: FeedLook[];
  newArrivals: Product[];
  reelsPreview: ReelPreview[];
}) {
  const [tab, setTab] = useState<HomeTab>("lookbook");

  return (
    <main>
      <AnnouncementBar />
      <EditorialHero looks={heroLooks} />
      <div className="md:hidden">
        <TopNav active={tab} onChange={setTab} />
        {tab === "lookbook" && <HomeFeed looks={looks} />}
        {tab === "shop" && <ProductGrid title="Shop" products={newArrivals} />}
        {tab === "video" && <ReelsPreviewGrid reels={reelsPreview} />}
      </div>
      {/* Desktop keeps the original lookbook feed — TopNav is mobile-only */}
      <div className="hidden md:block">
        <HomeFeed looks={looks} />
      </div>
    </main>
  );
}
