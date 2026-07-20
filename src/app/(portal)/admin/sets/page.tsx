import { prisma } from "@/lib/prisma";
import CreateSetForm from "./create-set-form";
import SetsTable from "./sets-table";

export default async function AdminSetsPage() {
  const sets = await prisma.vocabSet.findMany({
    orderBy: { number: "asc" },
    include: { _count: { select: { words: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="hero-band p-6 md:p-8">
        <div className="relative">
          <div className="hero-rule mb-3" />
          <h1 className="page-title text-2xl md:text-3xl">Sets &amp; words</h1>
          <p className="mt-1 text-[#c9c5c1]">Create sets (1–30 or however many you need) and manage their words.</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Add a new set</h2>
        <CreateSetForm />
      </div>

      {sets.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-brand-700/70">No sets yet. Add one above, or use CSV import.</p>
        </div>
      ) : (
        <SetsTable
          sets={sets.map((set) => ({
            id: set.id,
            number: set.number,
            title: set.title,
            color: set.color,
            wordCount: set._count.words,
          }))}
        />
      )}
    </div>
  );
}
