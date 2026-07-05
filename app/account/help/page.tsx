const faqs = [
  { q: "How do I track my order?", a: "Open Profile → Order History to see the status of every order you've placed." },
  { q: "What payment methods are accepted?", a: "Checkout is powered by Paystack, which supports cards, bank transfer, and USSD." },
  { q: "How do I return an item?", a: "Contact us within 7 days of delivery from the Contact Us page and we'll walk you through it." },
];

export default function HelpPage() {
  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Get Help</h1>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="bg-paper-raised rounded-2xl p-4">
            <p className="text-sm font-medium mb-1">{f.q}</p>
            <p className="text-sm text-muted">{f.a}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted mt-6">
        Still stuck? <a href="/account/contact" className="text-ink underline">Contact us</a> directly.
      </p>
    </main>
  );
}
