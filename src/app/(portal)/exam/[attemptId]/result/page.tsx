import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const user = await requireUser();

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: { orderBy: { order: "asc" } } },
  });

  if (!attempt || attempt.userId !== user.id) notFound();

  const setNumbers: number[] = JSON.parse(attempt.setNumbers);
  const scorePercent = Math.round(attempt.scorePercent);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-700/60">Exam result</p>
        <h1 className="mt-2 text-4xl font-extrabold text-brand-900">{scorePercent}%</h1>
        <p className="mt-2 text-brand-700/70">
          {attempt.correctCount} of {attempt.totalQuestions} correct · Set{setNumbers.length > 1 ? "s" : ""}{" "}
          {setNumbers.join(", ")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/exam" className="btn btn-primary">
            New exam
          </Link>
          <Link href="/history" className="btn btn-secondary">
            View history
          </Link>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Question review</h2>
        <div className="space-y-3">
          {attempt.answers.map((answer, i) => {
            const correctAnswer =
              answer.direction === "TERM_TO_MEANING" ? answer.meaningSnapshot : answer.termSnapshot;
            const prompt = answer.direction === "TERM_TO_MEANING" ? answer.termSnapshot : answer.meaningSnapshot;

            return (
              <div
                key={answer.id}
                className={
                  "rounded-lg border p-4 " +
                  (answer.isCorrect ? "border-green-200 bg-green-50" : "border-brand-200 bg-brand-50/60")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-brand-700/60">Q{i + 1} · {prompt}</p>
                    <p className="mt-1 text-sm">
                      Your answer:{" "}
                      <span className={answer.isCorrect ? "font-semibold text-green-700" : "font-semibold text-brand-800"}>
                        {answer.userAnswer?.trim() ? answer.userAnswer : "— (skipped)"}
                      </span>
                    </p>
                    {!answer.isCorrect && (
                      <p className="mt-1 text-sm text-brand-700">
                        Correct answer: <span className="font-semibold">{correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  <span className={"badge " + (answer.isCorrect ? "!bg-green-100 !text-green-800" : "")}>
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
