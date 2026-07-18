import AppointmentForm from "@/components/AppointmentForm";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ look?: string; product?: string; subject?: string }>;
}) {
  const { look, product, subject } = await searchParams;
  const categories = await getCategories();

  return (
    <div className="px-5 md:px-0 py-6 md:py-16 max-w-5xl md:mx-auto">
      <AppointmentForm
        serviceOptions={categories.map((c) => c.name)}
        lookId={look}
        productId={product}
        contextLabel={subject}
      />
    </div>
  );
}
