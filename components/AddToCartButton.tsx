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

  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPending(true);
        const result = await addItem({ productId, variantId, size, name, price, currency, image });
        setPending(false);
        if (result.requiresAuth) {
          router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
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
  );
}
