import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSet } from "./actions";
import CreateSetForm from "./create-set-form";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminSetsPage() {
  const sets = await prisma.vocabSet.findMany({
    orderBy: { number: "asc" },
    include: { _count: { select: { words: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Sets &amp; words</h1>
        <p className="mt-1 text-brand-700/70">Create sets (1–30 or however many you need) and manage their words.</p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Add a new set</h2>
        <CreateSetForm />
      </div>

      <div className="card overflow-x-auto p-0">
        {sets.length === 0 ? (
          <p className="p-6 text-sm text-brand-700/70">No sets yet. Add one above, or use CSV import.</p>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-brand-700/70">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Words</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
                  <td className="px-4 py-3 font-semibold text-brand-800">{set.number}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {set.color && (
                        <span
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: set.color }}
                        />
                      )}
                      {set.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">{set._count.words}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/sets/${set.id}`} className="font-semibold text-brand-700 hover:underline">
                        Manage
                      </Link>
                      <form action={deleteSet}>
                        <input type="hidden" name="id" value={set.id} />
                        <ConfirmSubmitButton
                          message={`Delete "${set.title}" and all ${set._count.words} of its words? This cannot be undone.`}
                          className="font-semibold text-red-700 hover:underline"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
