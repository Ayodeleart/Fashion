import EnquiryForm from "@/components/EnquiryForm";

export const dynamic = "force-dynamic";

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ look?: string; product?: string; subject?: string }>;
}) {
  const { look, product, subject } = await searchParams;

  return (
    <div className="px-5 md:px-0 py-6 md:py-16 max-w-5xl md:mx-auto">
      <EnquiryForm lookId={look} productId={product} contextLabel={subject} />
    </div>
  );
}
