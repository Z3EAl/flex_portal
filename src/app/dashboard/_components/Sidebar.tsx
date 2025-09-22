"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName = "chat" | "home";

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path d="M7 17H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-5 4v-4Z" />
    </svg>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
    </svg>
  );
}

function iconFor(name?: IconName) {
  if (name === "chat") return <ChatIcon className="sidebar-icon" aria-hidden />;
  if (name === "home") return <HomeIcon className="sidebar-icon" aria-hidden />;
  return null;
}

export function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: IconName;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className="sidebar-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
    >
      {iconFor(icon)}
      <span>{label}</span>
    </Link>
  );
}
