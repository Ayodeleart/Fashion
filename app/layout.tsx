import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AyodeleGold",
  description: "AyodeleGold — fashionista.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Clash Display (hero/logo type) + General Sans (UI/body) via Fontshare */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-clash: 'Clash Display', ui-sans-serif, system-ui, sans-serif;
            --font-general: 'General Sans', ui-sans-serif, system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
