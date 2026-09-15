"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Discover", icon: "🏋️", match: (p) => p === "/" || p.startsWith("/place") },
  { href: "/events", label: "Events", icon: "🏃", match: (p) => p.startsWith("/events") },
  { href: "/shop", label: "Shop", icon: "🛒", match: (p) => p.startsWith("/shop") },
  { href: "/profile", label: "Profile", icon: "👤", match: (p) => p.startsWith("/profile") || p.startsWith("/admin") },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-line bg-surface/85 backdrop-blur-md">
      <div className="flex px-2 py-1.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="press flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5"
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full text-lg leading-none transition-colors ${
                  active ? "bg-brand-soft" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[11px] ${
                  active ? "font-semibold text-brand" : "text-muted"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
