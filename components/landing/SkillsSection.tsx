function FlowerDot({ size = 40, fill = "#f3f1ec" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {[0, 60, 120].map((deg) => (
        <ellipse
          key={deg}
          cx="20"
          cy="20"
          rx="9"
          ry="16"
          fill={fill}
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
    </svg>
  );
}

export default function SkillsSection() {
  return (
    <section className="bg-ink text-paper py-16 md:py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <p className="eyebrow text-paper/60 mb-8 md:mb-10">Fashion Skills &amp; Expertise</p>

        <div className="flex items-center gap-3 md:gap-4 mb-14 md:mb-16 overflow-x-auto no-scrollbar">
          <div className="h-px w-8 bg-paper/20 shrink-0" />
          <FlowerDot size={44} fill="#e7b8c2" />
          <div className="h-px w-10 bg-paper/20 shrink-0" />
          <FlowerDot size={30} fill="rgba(243,241,236,0.5)" />
          <div className="h-px w-10 bg-paper/20 shrink-0" />
          <FlowerDot size={24} fill="rgba(243,241,236,0.3)" />
          <div className="h-px w-10 bg-paper/20 shrink-0" />
          <FlowerDot size={20} fill="rgba(243,241,236,0.2)" />
          <div className="h-px w-10 bg-paper/20 shrink-0" />
          <FlowerDot size={16} fill="rgba(243,241,236,0.12)" />
          <div className="h-px flex-1 bg-paper/20" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-8">
          <span
            className="leading-none"
            style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(4rem, 14vw, 8rem)", color: "#e7b8c2" }}
          >
            60%
          </span>
          <div className="pb-2 md:pb-4">
            <p
              className="uppercase leading-[0.95]"
              style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(1.6rem, 4vw, 2.6rem)" }}
            >
              Styling &amp;
              <br />
              Lookbuilding
            </p>
            <p className="eyebrow text-paper/50 mt-2">Runway Looks</p>
          </div>
        </div>
      </div>
    </section>
  );
}
