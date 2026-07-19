import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sets", label: "Sets & words" },
  { href: "/admin/import", label: "CSV import" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="card h-fit p-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-700/60">
          Admin portal
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
