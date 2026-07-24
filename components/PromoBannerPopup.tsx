"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

const SESSION_KEY = "ariana_promo_dismissed";
const SHOW_AFTER_MS = 4000;
const SHOW_AFTER_SCROLL_PX = 400;

type Banner = { title: string; message: string; cta_text: string; cta_href: string; image_url: string | null };

export default function PromoBannerPopup() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    getSupabase()
      .from("ariana_promo_banner")
      .select("enabled, title, message, cta_text, cta_href, image_url")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.enabled || !data.title) return;
        setBanner(data);
      });
  }, []);

  useEffect(() => {
    if (!banner || visible) return;

    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    function onScroll() {
      if (window.scrollY > SHOW_AFTER_SCROLL_PX) {
        setVisible(true);
        clearTimeout(timer);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [banner, visible]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  if (!banner || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button aria-label="Dismiss" onClick={dismiss} className="absolute inset-0 bg-ink/50" />
      <div className="relative bg-paper rounded-3xl overflow-hidden max-w-sm w-full">
        <button
          onClick={dismiss}
          aria-label="Close"
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center ${
            banner.image_url ? "bg-black/40 text-white" : "text-muted"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          </svg>
        </button>

        {banner.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.image_url} alt="" className="w-full aspect-[4/5] object-cover" />
        )}

        <div className="p-6">
          <h2 className="font-display text-xl mb-2">{banner.title}</h2>
          {banner.message && <p className="text-sm text-muted mb-5">{banner.message}</p>}
          <Link
            href={banner.cta_href}
            onClick={dismiss}
            className="block text-center bg-ink text-paper rounded-full py-3 text-sm font-medium"
          >
            {banner.cta_text}
          </Link>
        </div>
      </div>
    </div>
  );
}
