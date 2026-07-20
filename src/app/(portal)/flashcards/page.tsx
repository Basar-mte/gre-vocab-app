import { prisma } from "@/lib/prisma";
import FlashcardSetupForm from "./setup-form";

export default async function FlashcardsPage() {
  const [sets, totalWords] = await Promise.all([
    prisma.vocabSet.findMany({
      orderBy: { number: "asc" },
      select: { number: true, title: true, _count: { select: { words: true } } },
    }),
    prisma.word.count(),
  ]);

  const availableSets = sets.map((s) => ({
    number: s.number,
    title: s.title,
    wordCount: s._count.words,
  }));

  return (
    <div className="space-y-6">
      <div className="hero-band p-6 md:p-8">
        <div className="relative">
          <div className="hero-rule mb-3" />
          <h1 className="page-title text-2xl md:text-3xl">Flashcards</h1>
          <p className="mt-1 text-[#c9c5c1]">
            Pick one or more sets — or combine a range — or pull a random mix from every word you have.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <FlashcardSetupForm availableSets={availableSets} totalWords={totalWords} />
      </div>
    </div>
  );
}
