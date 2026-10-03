"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, PanelLeftClose, PanelLeftOpen, UsersRound } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const sections = [
  {
    title: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Sales",
    items: [{ href: "/leads", label: "Leads", icon: UsersRound }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <aside
      className={`flex shrink-0 flex-col bg-[#1d2742] text-slate-300 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand */}
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-md text-sm">
              {/* <Building2 size={16} /> */}
              <Image src="/logo/uptownLogo.png" alt="Logo" width={23} height={23} />
            </span>
            <span className="text-[10px]">Uptown Spaces Lead Chain</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-5 px-2">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </p>
            )}
            {section.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  isActive(href) ? "bg-white/10 font-medium text-white" : "hover:bg-white/5 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={17} />
                {!collapsed && label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && <p className="px-5 py-4 text-[11px] text-slate-500">Real-estate lead manager</p>}
    </aside>
  );
}
