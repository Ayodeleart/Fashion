import type { LookbookPanel } from "@/components/Lookbook";

export default function GiftedHandsSection({ panels }: { panels: LookbookPanel[] }) {
  const images = panels.slice(0, 4);

  return (
    <section id="about" className="bg-paper py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[200px_1fr] gap-4 md:gap-10 mb-10 md:mb-16">
          <p className="eyebrow">About Me</p>
          <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed">
            Drawing on more than 5 years of experience in <span className="text-ink font-medium">fashion design</span>,
            I focus on creating unique, client-centered collections that highlight personal style. My process
            combines trend awareness with artisanal detail to deliver fashion that inspires confidence and
            individuality.
          </p>
        </div>

        <h2
          className="uppercase leading-[0.95] mb-10 md:mb-14"
          style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          The gifted hands
          <br />
          that shape fashion
        </h2>

        {images.length === 0 ? (
          <p className="text-sm text-muted">Add lookbook photos in admin (Lookbook — Landing) to fill this section.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {images.map((panel, i) => (
              <a
                key={panel.id}
                href={panel.href ?? "/catalog"}
                className={`relative rounded-2xl overflow-hidden bg-paper-raised block ${
                  i % 2 === 1 ? "mt-8 md:mt-14" : ""
                }`}
                style={{ aspectRatio: i % 2 === 0 ? "3/4" : "3/5" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={panel.image} alt={panel.label ?? ""} className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
