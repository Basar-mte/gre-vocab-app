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
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-3">
        <p className="table-head-cell !p-0 !pb-2 !pl-2">Admin portal</p>
        <nav className="flex flex-col gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-[#f5f5f5]"
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
