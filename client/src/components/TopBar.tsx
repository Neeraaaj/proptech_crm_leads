"use client";

import { usePathname } from "next/navigation";

// Page title comes from the URL so every page gets a consistent header for free.
function titleFor(pathname: string) {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/leads/")) return "Lead Details";
  if (pathname.startsWith("/leads")) return "Leads";
  return "";
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-white px-5">
      <h1 className="text-lg font-medium text-slate-900"></h1>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
        title="Signed in user"
      >
        NP
      </div>
    </header>
  );
}
