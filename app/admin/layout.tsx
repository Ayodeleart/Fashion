import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AyodeleGold Admin",
  manifest: "/admin-manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#101010",
};

// No nav/shell here — that lives in app/admin/(dashboard)/layout.tsx so
// /admin/login (outside that route group) renders as a clean standalone
// page instead of inheriting the authenticated app shell.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
