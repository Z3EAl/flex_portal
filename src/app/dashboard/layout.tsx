import type { ReactNode } from "react";
import { SidebarLink } from "./_components/Sidebar"; // <— this path matches your tree

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">FL</span>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#cfe7de]">Flex Portal</div>
            <div className="text-white font-semibold">Dashboard</div>
          </div>
        </div>

        <nav className="nav space-y-1">
          <SidebarLink href="/dashboard/reviews" label="Reviews management" icon="chat" />
          <SidebarLink href="/dashboard/properties" label="Properties management" icon="home" />
        </nav>
      </aside>

      <main>{children}</main>
    </div>
  );
}
