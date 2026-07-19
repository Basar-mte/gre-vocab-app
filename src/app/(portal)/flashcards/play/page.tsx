import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pickQuestionWords } from "@/lib/exam";
import FlashcardViewer from "../flashcard-viewer";

export default async function FlashcardsPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ sets?: string; shuffle?: string; count?: string }>;
}) {
  const params = await searchParams;
  const setNumbers = (params.sets ?? "")
    .split(",")
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n));

  if (setNumbers.length === 0) {
    return <EmptyState message="No sets selected." />;
  }

  const shuffle = params.shuffle !== "false";

  const words = await prisma.word.findMany({
    where: { set: { number: { in: setNumbers } } },
    orderBy: [{ set: { number: "asc" } }, { term: "asc" }],
  });

  if (words.length === 0) {
    return <EmptyState message="The selected sets don't have any words yet." />;
  }

  const count = params.count ? parseInt(params.count, 10) : words.length;
  const selection = pickQuestionWords(words, count, shuffle);

  return (
    <FlashcardViewer
      words={selection.map((w) => ({
        id: w.id,
        term: w.term,
        meaning: w.meaning,
        partOfSpeech: w.partOfSpeech,
        example: w.example,
      }))}
      setNumbers={setNumbers}
      shuffle={shuffle}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="mb-4 text-brand-800">{message}</p>
      <Link href="/flashcards" className="btn btn-primary">
        Back to setup
      </Link>
    </div>
  );
}
