import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/catalog", label: "All products" },
      { href: "/", label: "Lookbook" },
      { href: "/reels", label: "Reels" },
    ],
  },
  {
    heading: "Services",
    links: [
      { href: "/appointment", label: "Book an appointment" },
      { href: "/enquiry", label: "Make an enquiry" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/account/profile", label: "My account" },
      { href: "/saved", label: "Saved items" },
      { href: "/cart", label: "Cart" },
    ],
  },
];

export default function DesktopFooter() {
  return (
    <footer className="border-t border-ink/10 bg-paper mt-16">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-4 gap-8">
        <div>
          <p className="font-display text-xl mb-3">AyodeleGold</p>
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            Modern African tailoring — bespoke and ready-to-wear, for the pieces you actually get dressed up for.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-xs uppercase tracking-wide text-muted mb-3">{col.heading}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink/80 hover:text-ink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between text-xs text-muted">
          <p>© {new Date().getFullYear()} AyodeleGold. All rights reserved.</p>
          <p>Built for those who dress with intention.</p>
        </div>
      </div>
    </footer>
  );
}
