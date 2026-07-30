import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import PwaBootstrap from "@/components/pwa/PwaBootstrap";

export const metadata: Metadata = {
  title: "Heinrich Co. — Operations",
  description: "Internal operations command center for Heinrich Co.",
  applicationName: "HCo Ops",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HCo Ops",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B1D1E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PwaBootstrap />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
