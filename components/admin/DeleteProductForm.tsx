"use client";

export default function DeleteProductForm({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this product? This removes its images too and can't be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-red-700 hover:underline">
        Delete product
      </button>
    </form>
  );
}
