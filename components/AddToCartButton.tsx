"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

type Props = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  className?: string;
};

export default function AddToCartButton({ productId, name, price, currency, image, className }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({ productId, name, price, currency, image });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={
        className ??
        "text-xs px-3 py-1.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors"
      }
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
