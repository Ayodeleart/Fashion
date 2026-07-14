"use client";

import { useEffect } from "react";

export default function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-paper rounded-t-3xl max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] animate-[sheet-up_0.25s_ease-out]">
        <div className="sticky top-0 bg-paper flex justify-center pt-2.5 pb-1 z-10">
          <div className="w-10 h-1 rounded-full bg-ink/15" />
        </div>
        {children}
      </div>
      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(24px); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
