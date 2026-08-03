"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

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

// Was a single lonely "60% Styling & Lookbuilding" stat with no other
// content around it — expanded into the actual service breakdown so the
// section has real substance instead of one number floating in space.
const SKILLS = [
  { percent: "60%", label: "Bespoke Tailoring", sub: "Made-to-measure" },
  { percent: "25%", label: "Ready-to-Wear", sub: "Signature collections" },
  { percent: "15%", label: "Bridal & Occasion", sub: "Wedding & event wear" },
];

export default function SkillsSection() {
  const ref = useScrollReveal<HTMLElement>(100);
  return (
    <section ref={ref} className="bg-ink text-paper py-16 md:py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <p className="eyebrow text-paper/60 mb-8 md:mb-10" data-reveal="heading">Fashion Skills &amp; Expertise</p>

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

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {SKILLS.map((skill, i) => (
            <div
              key={skill.label}
              data-reveal="stat"
              className={`flex items-end gap-3 md:gap-4 ${i > 0 ? "pt-8 md:pt-0 border-t md:border-t-0 border-paper/10" : ""}`}
            >
              <span
                className="leading-none shrink-0"
                style={{
                  fontFamily: "var(--font-landing-display)",
                  fontSize: "clamp(2.8rem, 8vw, 4.2rem)",
                  color: i === 0 ? "#e7b8c2" : "rgba(231,184,194,0.55)",
                }}
              >
                {skill.percent}
              </span>
              <div className="pb-1">
                <p
                  className="uppercase leading-[0.95]"
                  style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(1.1rem, 2.6vw, 1.5rem)" }}
                >
                  {skill.label}
                </p>
                <p className="eyebrow text-paper/50 mt-1">{skill.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
