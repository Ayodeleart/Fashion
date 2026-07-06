"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function RevealContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useScrollReveal<HTMLDivElement>(80);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
