"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomSheet from "@/components/BottomSheet";
import { useCart } from "@/components/CartProvider";
import { useRouter, usePathname } from "next/navigation";

export type QuickAddProduct = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  slug: string;
  category: string | null;
};

type Variant = { id: string; size: string; color: string | null; stock: number };

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  ariana_product_images: { url: string; position: number }[];
};

type QuickAddContextValue = {
  openQuickAdd: (product: QuickAddProduct) => void;
};

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const { addItem, count } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [product, setProduct] = useState<QuickAddProduct | null>(null);
  const [step, setStep] = useState<"closed" | "size" | "added">("closed");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [chosen, setChosen] = useState<Variant | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);

  const openQuickAdd = useCallback((p: QuickAddProduct) => {
    setProduct(p);
    setStep("size");
    setChosen(null);
    setVariants([]);
    setLoadingVariants(true);
    fetch(`/api/products/${p.id}/variants`)
      .then((res) => res.json())
      .then((data) => setVariants(data.variants ?? []))
      .finally(() => setLoadingVariants(false));
  }, []);

  useEffect(() => {
    if (step !== "added" || !product) return;
    fetch(`/api/products/related?category=${encodeURIComponent(product.category ?? "")}&exclude=${product.id}`)
      .then((res) => res.json())
      .then((data) => setRelated(data.products ?? []));
  }, [step, product]);

  async function pickSize(v: Variant) {
    if (!product || v.stock <= 0) return;
    const result = await addItem({
      productId: product.id,
      variantId: v.id,
      size: v.size,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
    });
    if (result.requiresAuth) {
      setStep("closed");
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setChosen(v);
    setStep("added");
  }

  function close() {
    setStep("closed");
    setProduct(null);
  }

  return (
    <QuickAddContext.Provider value={{ openQuickAdd }}>
      {children}

      <BottomSheet open={step === "size"} onClose={close}>
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-medium tracking-wide">SELECT SIZE</h2>
            <button onClick={close} aria-label="Close" className="text-2xl leading-none text-ink/60">
              ×
            </button>
          </div>
          {loadingVariants ? (
            <p className="text-sm text-muted py-6 text-center">Loading sizes…</p>
          ) : variants.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No sizes available for this item.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {variants.map((v) => {
                const disabled = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickSize(v)}
                    className={`py-4 rounded-lg border text-sm transition-colors ${
                      disabled ? "border-ink/10 text-muted/40 line-through" : "border-ink/20 hover:border-ink hover:bg-ink hover:text-paper"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>

      <BottomSheet open={step === "added"} onClose={close}>
        {product && (
          <div className="px-5 pb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">✓</span>
                <h2 className="text-base font-medium tracking-wide">ADDED TO BAG</h2>
              </div>
              <button onClick={close} aria-label="Close" className="text-2xl leading-none text-ink/60">
                ×
              </button>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-paper-raised shrink-0">
                {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />}
              </div>
              <div>
                <p className="text-sm">{product.name}</p>
                <p className="text-sm font-medium">{formatPrice(product.price, product.currency)}</p>
                {chosen && <p className="text-xs text-muted mt-0.5">Size: {chosen.size}{chosen.color ? ` | Color: ${chosen.color}` : ""}</p>}
              </div>
            </div>

            <Link
              href="/cart"
              className="block w-full text-center border border-ink/20 rounded-full py-3 text-sm font-medium mb-6 hover:border-ink/40 transition-colors"
            >
              View Bag ({count})
            </Link>

            {related.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Often bought together</p>
                <ul className="space-y-3">
                  {related.slice(0, 3).map((p) => {
                    const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
                    return (
                      <li key={p.id} className="flex items-center gap-3">
                        <Link href={`/product/${p.slug}`} className="relative w-14 h-16 rounded-lg overflow-hidden bg-paper-raised shrink-0" onClick={close}>
                          {image && <Image src={image.url} alt={p.name} fill className="object-cover" sizes="56px" />}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{p.name}</p>
                          <p className="text-sm text-muted">{formatPrice(p.price, p.currency)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openQuickAdd({
                              id: p.id,
                              name: p.name,
                              price: p.price,
                              currency: p.currency,
                              image: image?.url ?? "",
                              slug: p.slug,
                              category: product.category,
                            })
                          }
                          className="text-xs px-4 py-1.5 rounded-full bg-ink text-paper shrink-0"
                        >
                          Add
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd must be used within QuickAddProvider");
  return ctx;
}
