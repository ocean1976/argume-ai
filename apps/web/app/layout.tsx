import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clash of AI | Ideas clash. Best answer wins.",
  description: "Clash of AI - Where AI Ideas Collide. Orchestrate multiple AI models to find the absolute truth.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Clash of AI",
    description: "Ideas clash. Best answer wins.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Clash of AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Clash of AI",
    description: "Ideas clash. Best answer wins.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
