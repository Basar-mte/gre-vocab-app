import { prisma } from "@/lib/prisma";
import ExamSetupForm from "./setup-form";

export default async function ExamSetupPage() {
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
        <h1 className="page-title text-2xl text-brand-900 md:text-3xl">Take an exam</h1>
        <p className="mt-1 text-brand-700/70">
          Combine any sets or a range, choose how many words, and pick a question style.
        </p>
      </div>

      <div className="card p-6">
        <ExamSetupForm availableSets={availableSets} />
      </div>
    </div>
  );
}
