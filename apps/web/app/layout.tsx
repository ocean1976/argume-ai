import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "argu me | Tek bir AI'a sorma. Meclise danış.",
  description: "Sorunu yaz, AI'lar kendi aralarında tartışsın. Farklı perspektifler i gör, en doğru ve kapsamlı cevaba ulaş.",  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "argu me | Tek bir AI'a sorma. Meclise danış.",
    description: "Sorunu yaz, AI'lar kendi aralarında tartışsın. Farklı perspektifleri gör, en doğru ve kapsamlı cevaba ulaş.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "argu me Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "argu me | Tek bir AI'a sorma. Meclise danış.",
    description: "Sorunu yaz, AI'lar kendi aralarında tartışsın. Farklı perspektifleri gör, en doğru ve kapsamlı cevaba ulaş.",
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
