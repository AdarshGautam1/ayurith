import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
        <header className="sticky top-0 z-50 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-[#e5e0d5] shadow-2xs">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#144226] text-white flex items-center justify-center font-heading font-bold text-lg shadow-2xs">
                  A
                </div>
                <span className="text-xl font-bold font-heading text-[#10291a] tracking-tight">
                  AyuRith
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f3eee1] border border-[#e0d6c1] text-[#7a5a19]">
                  IP-SHAKTI Sahayak
                </span>
              </Link>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link 
                href="/" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#384a3e] hover:text-[#10291a] hover:bg-[#f0ece1] transition-colors"
              >
                Overview
              </Link>
              <Link 
                href="/classifier" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#384a3e] hover:text-[#10291a] hover:bg-[#f0ece1] transition-colors"
              >
                Classifier
              </Link>
              <Link 
                href="/chat" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#384a3e] hover:text-[#10291a] hover:bg-[#f0ece1] transition-colors"
              >
                Assistant
              </Link>
              <Link
                href="/chat"
                className="hidden md:inline-flex items-center gap-1.5 ml-2 px-3.5 py-1.5 rounded-lg bg-[#144226] hover:bg-[#0e311c] text-white text-xs font-semibold tracking-wide transition-all shadow-2xs"
              >
                Consult Assistant
              </Link>
            </nav>
          </div>
        </header>
        
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
