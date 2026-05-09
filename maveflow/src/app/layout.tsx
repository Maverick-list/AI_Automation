import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./site.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MaveFlow - AI Automation",
  description: "Automate your Google Workspace with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans dark", inter.variable)}>
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
