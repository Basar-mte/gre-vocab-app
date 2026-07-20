import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EditSetForm from "./edit-set-form";
import AddWordForm from "./add-word-form";
import WordsTable from "./words-table";

export default async function AdminSetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const set = await prisma.vocabSet.findUnique({
    where: { id },
    include: { words: { orderBy: { term: "asc" } } },
  });

  if (!set) notFound();

  return (
    <div className="space-y-6">
      <div className="hero-band p-6 md:p-8">
        <div className="relative">
          <Link href="/admin/sets" className="text-sm font-semibold text-[#f0d9d9] hover:underline">
            ← All sets
          </Link>
          <div className="hero-rule my-3" />
          <h1 className="page-title text-2xl md:text-3xl">
            Set {set.number} · {set.title}
          </h1>
          <p className="mt-1 text-[#c9c5c1]">{set.words.length} words</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Set details</h2>
        <EditSetForm set={{ id: set.id, title: set.title, description: set.description, color: set.color }} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Add a word</h2>
        <AddWordForm setId={set.id} />
      </div>

      {set.words.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-brand-700/70">No words in this set yet. Add one above, or use CSV import.</p>
        </div>
      ) : (
        <WordsTable
          setId={set.id}
          words={set.words.map((word) => ({
            id: word.id,
            term: word.term,
            meaning: word.meaning,
            mnemonic: word.mnemonic,
            partOfSpeech: word.partOfSpeech,
            example: word.example,
            synonyms: word.synonyms,
          }))}
        />
      )}
    </div>
  );
}
