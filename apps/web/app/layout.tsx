import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Argume.ai | Tek bir AI'a sorma. Meclise danış.",
  description: "Sorunu yaz, AI'lar kendi aralarında tartışsın. Farklı perspektifleri gör, en doğru ve kapsamlı cevaba ulaş.",
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
