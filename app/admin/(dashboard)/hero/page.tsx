import HeroUploadWorkflow from "@/components/admin/HeroUploadWorkflow";

export const dynamic = "force-dynamic";

export default function AdminHeroPage() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Hero Looks</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        Upload up to 3 images (middle is required — it's the only one shown
        on mobile). Backgrounds are removed automatically in your browser,
        then the cutouts publish over your chosen hero color.
      </p>
      <HeroUploadWorkflow />
    </div>
  );
}
