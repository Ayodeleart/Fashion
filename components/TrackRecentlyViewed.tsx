"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/lib/recently-viewed";

export default function TrackRecentlyViewed({
  id,
  name,
  slug,
  price,
  currency,
  category,
  image,
}: {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string | null;
  image: string;
}) {
  useEffect(() => {
    trackRecentlyViewed({ id, name, slug, price, currency, category, image });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
