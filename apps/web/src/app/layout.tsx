import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WatchStreak — Turn Playlists into Courses",
  description:
    "Convert YouTube playlists into structured, trackable learning courses with daily goals and progress visualization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} antialiased`}>
        <Nav />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/70 backdrop-blur-md rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-50">
      <a
        href="/dashboard"
        className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2 hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">dashboard</span>
        <span className="font-label text-[10px] font-medium uppercase tracking-widest mt-1">
          Dashboard
        </span>
      </a>
      <a
        href="/courses"
        className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2 hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">
          subscriptions
        </span>
        <span className="font-label text-[10px] font-medium uppercase tracking-widest mt-1">
          Courses
        </span>
      </a>
      <a
        href="#"
        className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2 hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">settings</span>
        <span className="font-label text-[10px] font-medium uppercase tracking-widest mt-1">
          Settings
        </span>
      </a>
    </nav>
  );
}
