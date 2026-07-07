import Link from "next/link";
import TopBar from "@/components/TopBar";

// Entry point wired up from the Aria menu. The actual photo + reference-
// object measurement pipeline (MediaPipe Pose, slider correction UX) is
// its own build — deliberately not stubbed with fake logic here.
export default function MeasurementsPage() {
  return (
    <main>
      <TopBar />
      <div className="px-5 pb-10 flex flex-col gap-4 items-start">
        <h1 className="text-lg font-semibold">Measurements</h1>
        <p className="text-sm text-muted">
          This is where the photo-based measurement flow will live — two photos,
          a reference object for scale, and a slider to fine-tune each number
          before it's saved to your profile. Not built yet.
        </p>
        <Link href="/catalog" className="text-sm text-brass underline">
          Back to shop
        </Link>
      </div>
    </main>
  );
}
