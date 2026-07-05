export default function ContactPage() {
  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Contact Us</h1>
      <div className="bg-paper-raised rounded-2xl divide-y divide-ink/5">
        <a href="mailto:hello@ayodelegold.com" className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Email</span>
          <span className="text-sm text-muted">hello@ayodelegold.com</span>
        </a>
        <a href="tel:+2340000000000" className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Phone</span>
          <span className="text-sm text-muted">+234 000 000 0000</span>
        </a>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Hours</span>
          <span className="text-sm text-muted">Mon–Sat, 9am–6pm</span>
        </div>
      </div>
    </main>
  );
}
