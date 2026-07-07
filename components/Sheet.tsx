"use client";

export default function Sheet({
  open,
  onClose,
  onBack,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="absolute bottom-0 left-0 right-0 bg-paper rounded-t-3xl max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-paper flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} aria-label="Back" className="text-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
