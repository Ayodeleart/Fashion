"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/hero", label: "Hero Looks" },
  { href: "/admin/shop-hero", label: "Shop Hero" },
  { href: "/admin/reels", label: "Reels" },
  { href: "/admin/lookbook", label: "Lookbook (Home)" },
  { href: "/admin/landing-lookbook", label: "Lookbook (Landing)" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/promo-banner", label: "Promo Banner" },
  { href: "/admin/login-background", label: "Login Background" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-ink/10 bg-paper flex md:flex-col md:justify-between">
      <div className="min-w-0">
        <div className="px-5 py-6">
          <p className="font-display text-lg">AYODELE<span className="text-brass">GOLD</span></p>
        </div>
        <ul className="flex md:flex-col px-2 md:px-3 pb-4 gap-1 overflow-x-auto w-full min-w-0">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink hover:bg-ink/5"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <form action={logout} className="px-2 md:px-3 pb-4 hidden md:block">
        <button type="submit" className="w-full text-left px-3 py-2 rounded text-sm text-muted hover:bg-ink/5 transition-colors">
          Sign out
        </button>
      </form>
    </nav>
  );
}
