"use client";

import Link from "next/link";
import { EllipsisVertical, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", active: pathname === "/" },
    {
      href: "/sheets",
      label: "Sheets",
      active: pathname === "/sheets" || pathname.startsWith("/sheets/"),
    },
    {
      href: "/nominalRoll",
      label: "Nominal Rolls",
      active:
        pathname === "/nominalRoll" || pathname.startsWith("/nominalRoll/"),
    },
    {
      href: "/people",
      label: "People",
      active: pathname === "/people",
    },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center">
            <span
              className="truncate font-display text-lg font-bold text-orange-600 sm:text-xl"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Sewa Manager
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-orange-100 text-orange-700"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-700 transition-colors hover:bg-stone-100 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <EllipsisVertical className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-orange-100 text-orange-700"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
              >
                <span>Logout</span>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
