"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

type Props = {
  productId: string;
  variantId?: string | null;
  size?: string | null;
  name: string;
  price: number;
  currency: string;
  image: string;
  disabled?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  variantId = null,
  size = null,
  name,
  price,
  currency,
  image,
  disabled,
  className,
}: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative inline-block w-full md:w-auto">
      <button
        type="button"
        disabled={pending || disabled}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setPending(true);
          setError(null);
          const result = await addItem({ productId, variantId, size, name, price, currency, image });
          setPending(false);
          if (result.requiresAuth) {
            router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
            return;
          }
          if (result.error) {
            setError(result.error);
            setTimeout(() => setError(null), 4000);
            return;
          }
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        className={
          className ??
          "text-xs px-3 py-1.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-50"
        }
      >
        {pending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
      </button>
      {error && (
        <p className="absolute top-full left-0 mt-1 text-[11px] text-red-600 whitespace-nowrap">{error}</p>
      )}
    </div>
  );
}
