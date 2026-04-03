"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "My Courses" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 glass-header flex justify-between items-center px-8 h-16">
      <Link
        href="/"
        className="text-2xl font-light tracking-tighter text-primary font-headline"
      >
        WatchStreak
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`font-label tracking-tight text-sm transition-colors ${
                active
                  ? "text-primary font-semibold border-b-2 border-primary-container"
                  : "text-on-surface-variant font-medium hover:text-primary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
        <span className="material-symbols-outlined text-primary">
          account_circle
        </span>
      </button>
    </nav>
  );
}
