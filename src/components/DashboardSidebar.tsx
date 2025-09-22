"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { properties } from "@/lib/properties";

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link href={href} className="sidebar-link" data-active={active || undefined}>
      {children}
    </Link>
  );
}

export default function DashboardSidebar() {
  return (
    <aside className="sidebar w-[240px] shrink-0 px-5 py-6 overflow-y-auto">
      <div className="flex items-center gap-2 px-2">
        <span className="brand-dot" />
        <span className="text-white/90 font-semibold tracking-wide">
          Flex Living
        </span>
      </div>

      <nav className="mt-8 space-y-1">
        <NavItem href="/dashboard/reviews">
          {/* grid icon */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M4 4h16v6H4z" />
            <path d="M4 14h7v6H4zM13 14h7v6h-7z" />
          </svg>
          Reviews management
        </NavItem>

        <NavItem href="/dashboard/properties">
          {/* home icon */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="m3 11 9-7 9 7" />
            <path d="M5 10v10h14V10" />
          </svg>
          Properties management
        </NavItem>
      </nav>

      {/* quick links list (read-only) */}
      <div className="mt-6">
        <div className="sidebar-section-title">Properties</div>
        <ul className="mt-3 space-y-1">
          {properties.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/property/${encodeURIComponent(p.slug)}`}
                className="sidebar-sublink"
              >
                <span className="sidebar-sublink-dot" />
                <span className="truncate">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
