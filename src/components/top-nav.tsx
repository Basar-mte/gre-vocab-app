"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth-actions";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/exam", label: "Exam" },
  { href: "/history", label: "History" },
];

const aboutLink = { href: "/about", label: "About" };

export default function TopNav({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "STUDENT" };
}) {
  const pathname = usePathname();
  const links =
    user.role === "ADMIN"
      ? [...studentLinks, { href: "/admin", label: "Admin Portal" }, aboutLink]
      : [...studentLinks, aboutLink];

  return (
    <header className="sticky top-0 z-20 bg-[#111111]">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-3.5">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#D32C32] text-sm text-white">
            GE
          </span>
          <span className="hidden font-serif text-[17px] tracking-[.2px] sm:inline">GREasy</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto pl-2">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active ? "bg-[#D32C32] text-white" : "text-[#c9c5c1] hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-[13px] leading-tight sm:block">
            <div className="font-semibold text-white">{user.name}</div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#c9c5c1]">{user.role}</span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:border-[#D32C32] hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
