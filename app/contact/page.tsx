import { getBackdropImage } from "@/lib/backdrop";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const backdrop = await getBackdropImage();

  return (
    <main className="relative min-h-screen flex items-center overflow-hidden bg-[#0d2420]">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-l from-[#0d2420] via-[#0d2420]/85 to-transparent" />

      <div className="relative z-10 px-6 md:px-16 py-24 max-w-md ml-auto">
        <p className="text-brass text-xs tracking-[0.2em] uppercase mb-4">Contact</p>
        <h1 className="font-display text-3xl md:text-4xl text-paper mb-6 leading-tight">
          Get in touch
        </h1>
        <p className="text-paper/80 leading-relaxed mb-8">
          Questions about a fitting, a bespoke order, or anything else — send us a note and we'll
          reply directly.
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
