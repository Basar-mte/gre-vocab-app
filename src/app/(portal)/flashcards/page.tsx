import { prisma } from "@/lib/prisma";
import FlashcardSetupForm from "./setup-form";

export default async function FlashcardsPage() {
  const sets = await prisma.vocabSet.findMany({
    orderBy: { number: "asc" },
    select: { number: true, title: true, _count: { select: { words: true } } },
  });

  const availableSets = sets.map((s) => ({
    number: s.number,
    title: s.title,
    wordCount: s._count.words,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Flashcards</h1>
        <p className="mt-1 text-brand-700/70">
          Pick one or more sets — or combine a range — optionally shuffle, and start studying.
        </p>
      </div>

      <div className="card p-6">
        <FlashcardSetupForm availableSets={availableSets} />
      </div>
    </div>
  );
}
