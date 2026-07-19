import { requireUser } from "@/lib/session";
import TopNav from "@/components/top-nav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#fff5f5,_#fffaf9_55%)]">
      <TopNav user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-brand-100 py-4 text-center text-xs text-brand-700/60">
        GRE Vocabulary | Goldmine
      </footer>
    </div>
  );
}
