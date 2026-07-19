import Link from "next/link";
import { signOutAction } from "@/app/actions/auth-actions";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/exam", label: "Exam" },
  { href: "/history", label: "History" },
];

export default function TopNav({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "STUDENT" };
}) {
  const links = user.role === "ADMIN" ? [...studentLinks, { href: "/admin", label: "Admin Portal" }] : studentLinks;

  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-brand-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            GV
          </span>
          <span className="hidden sm:inline">GRE Vocabulary | Goldmine</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-brand-800 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <div className="font-medium text-brand-900">{user.name}</div>
            <span className="badge">{user.role}</span>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-ghost text-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
