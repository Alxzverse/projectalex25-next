import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectAlex25 | High-Performance Personal Growth & Habit Architecture",
  description:
    "Architect your next evolution across Mind, Body, Craft, Wealth, and Spirit. Full-stack personal growth platform with Habit Matrix, Protocol 25 Challenges, Deep Work Studio, Stoic Journaling, and The Arena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#07080c] text-zinc-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
