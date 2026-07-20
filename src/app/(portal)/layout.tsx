import Link from "next/link";
import { requireUser } from "@/lib/session";
import TopNav from "@/components/top-nav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col bg-[#f5f5f5]">
      <TopNav user={user} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-6">{children}</main>
      <footer className="border-t border-[#e3dfda] px-6 py-4 text-center text-[12px] tracking-[.04em] text-[#8a8480]">
        <b className="text-[#D32C32]">GREasy</b> &middot;{" "}
        <Link href="/about" className="hover:underline">
          About &amp; contact
        </Link>
      </footer>
    </div>
  );
}
