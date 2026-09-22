import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeSync | AI-Assisted Pre-Hospital Emergency Coordination",
  description: "Synchronizing critical pre-hospital emergency information before patient arrival.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
