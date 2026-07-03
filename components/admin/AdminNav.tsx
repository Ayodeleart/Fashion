"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/hero", label: "Hero Videos" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-ink/10 bg-paper">
      <div className="px-5 py-6">
        <p className="font-display text-lg">Ariana Admin</p>
      </div>
      <ul className="flex md:flex-col px-2 md:px-3 pb-4 gap-1 overflow-x-auto">
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
    </nav>
  );
}
