import Link from "next/link";
import MeasurementsFlow from "@/components/MeasurementsFlow";
import RequireAuth from "@/components/RequireAuth";

export default function MeasurementsPage() {
  return (
    <main>
      <div className="px-5 pt-4 pb-10 flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Measurements</h1>
        <RequireAuth feature="AI Measure Me">
          <MeasurementsFlow />
        </RequireAuth>
        <Link href="/catalog" className="text-sm text-brass underline self-start">
          Back to shop
        </Link>
      </div>
    </main>
  );
}

