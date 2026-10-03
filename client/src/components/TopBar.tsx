"use client";

export function TopBar() {
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
