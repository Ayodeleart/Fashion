export default function CartPage() {
  return (
    <main className="px-6 md:px-10 py-20 md:py-28 max-w-2xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Cart</h1>
      <p className="text-muted leading-relaxed">
        Cart functionality (adding items, quantities, checkout) isn't built yet — this is a
        placeholder so the link works. This needs its own dedicated pass: cart state, product
        detail pages with size/variant selection, and wiring into the existing Paystack checkout.
      </p>
    </main>
  );
}
