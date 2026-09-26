import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "AyuRith | IP-SHAKTI Sahayak",
  description: "Ayurvedic IP & Regulatory Guidance Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="ipshakti">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-base-200 min-h-screen flex flex-col font-body`}>
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
          {children}
        </main>
        
        <footer className="border-t border-[#e2dcd0] bg-[#f7f5ed] text-[#4d5f52] py-8 text-xs">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="font-heading font-bold text-sm text-[#14281c]">
                AyuRith • IP-SHAKTI Sahayak
              </p>
              <p className="text-[#647669]">
                Traditional Knowledge Digital Library (TKDL) • First Schedule (54 Treatises) • Section 3(p) The Patents Act, 1970
              </p>
            </div>
            <div className="text-center md:text-right text-[#7a8c7f] max-w-md">
              Statutory reference repository & citation engine. Informational advisory only; not formal legal counsel.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
