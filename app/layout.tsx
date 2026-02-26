import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import pkg from "../package.json";

export const metadata: Metadata = {
  title: "Expo Scanner",
  description: "Scan exhibition booths and extract company info with AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Expo Scanner",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: root layout applies to all routes */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-[100dvh]" suppressHydrationWarning>
        <RegisterSW />
        {children}
        <footer className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-slate-400">
          v{pkg.version}
        </footer>
      </body>
    </html>
  );
}
