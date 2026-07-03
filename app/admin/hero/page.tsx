import HeroUploadWorkflow from "@/components/admin/HeroUploadWorkflow";

export default function AdminHeroPage() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Hero Videos</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        Upload a desktop clip. The tool generates a center-cropped portrait
        version for mobile, samples the dominant color, then publishes both
        to Supabase Storage and inserts a row in <code>hero_videos</code>.
        No masking or segmentation — just crop and color sampling, as scoped.
      </p>
      <HeroUploadWorkflow />
    </div>
  );
}
