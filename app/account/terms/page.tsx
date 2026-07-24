import AccountShell from "@/components/AccountShell";

export default function TermsPage() {
  return (
    <AccountShell>
    <main className="px-5 py-6 pb-16">
      <h1 className="font-display text-2xl mb-4">Terms & Conditions</h1>
      <div className="text-sm text-muted space-y-4 leading-relaxed">
        <p>By using this app, you agree to purchase products in good faith and provide accurate delivery information.</p>
        <p>Prices are shown in the listed currency and may change without notice. Orders are confirmed once payment via Paystack succeeds.</p>
        <p>Returns and exchanges are handled on a case-by-case basis — contact us within 7 days of delivery.</p>
        <p>We reserve the right to update these terms; continued use of the app means you accept the latest version.</p>
      </div>
    </main>
  </AccountShell>
  );
}
