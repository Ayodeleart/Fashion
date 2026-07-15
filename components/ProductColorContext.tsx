"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ProductColorContextValue = {
  colors: string[];
  selectedColor: string | null;
  pickColor: (color: string) => void;
};

const ProductColorContext = createContext<ProductColorContextValue | null>(null);

export function ProductColorProvider({
  colors,
  children,
}: {
  colors: string[];
  children: React.ReactNode;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);

  const value = useMemo(
    () => ({ colors, selectedColor, pickColor: setSelectedColor }),
    [colors, selectedColor]
  );

  return <ProductColorContext.Provider value={value}>{children}</ProductColorContext.Provider>;
}

export function useProductColor() {
  const ctx = useContext(ProductColorContext);
  if (!ctx) throw new Error("useProductColor must be used within a ProductColorProvider");
  return ctx;
}
