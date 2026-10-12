import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "PipelinePulse: GitHub Actions health at a glance",
  description: "Success rate, build time and recovery time for any public GitHub repository.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${plex.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
