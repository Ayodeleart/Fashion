import type { Metadata, Viewport } from "next";
import "./globals.css";
import StorefrontChrome from "@/components/StorefrontChrome";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "AyodeleGold",
  description: "AyodeleGold — fashionista.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AyodeleGold",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#101010",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      <body className="min-h-full flex flex-col">
        <RegisterSW />
        <StorefrontChrome>{children}</StorefrontChrome>
      </body>
    </html>
  );
}
