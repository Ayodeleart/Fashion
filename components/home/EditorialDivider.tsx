export default function EditorialDivider({ label }: { label: string }) {
  return (
    <div data-reveal="paragraph" className="px-6 md:px-14 py-14 md:py-20 flex items-center gap-6">
      <span className="h-px flex-1 bg-ink/10" />
      <h2 className="font-display text-2xl md:text-4xl text-ink text-center shrink-0">
        {label}
      </h2>
      <span className="h-px flex-1 bg-ink/10" />
    </div>
  );
}
