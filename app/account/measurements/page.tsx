import Link from "next/link";
import TopBar from "@/components/TopBar";
import MeasurementsFlow from "@/components/MeasurementsFlow";

export default function MeasurementsPage() {
  return (
    <main>
      <TopBar />
      <div className="px-5 pb-10 flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Measurements</h1>
        <MeasurementsFlow />
        <Link href="/catalog" className="text-sm text-brass underline self-start">
          Back to shop
        </Link>
      </div>
    </main>
  );
}

