import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function HistoryPage() {
  const user = await requireUser();

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id, mode: "EXAM", completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Exam history</h1>
        <p className="mt-1 text-brand-700/70">All of your completed exam attempts.</p>
      </div>

      <div className="card overflow-x-auto p-0">
        {attempts.length === 0 ? (
          <p className="p-6 text-sm text-brand-700/70">
            No exams yet.{" "}
            <Link href="/exam" className="font-semibold text-brand-700 hover:underline">
              Take your first exam
            </Link>
            .
          </p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-brand-700/70">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Sets</th>
                <th className="px-4 py-3 font-medium">Direction</th>
                <th className="px-4 py-3 font-medium">Style</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
                  <td className="px-4 py-3">{attempt.completedAt?.toLocaleString()}</td>
                  <td className="px-4 py-3">{JSON.parse(attempt.setNumbers).join(", ")}</td>
                  <td className="px-4 py-3">{formatDirection(attempt.direction)}</td>
                  <td className="px-4 py-3">{attempt.format === "MULTIPLE_CHOICE" ? "Multiple choice" : "Typed"}</td>
                  <td className="px-4 py-3 font-semibold text-brand-800">
                    {attempt.correctCount}/{attempt.totalQuestions} ({Math.round(attempt.scorePercent)}%)
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/exam/${attempt.id}/result`} className="text-brand-700 hover:underline">
                      View
                    </Link>
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

function formatDirection(direction: string) {
  switch (direction) {
    case "TERM_TO_MEANING":
      return "Word → Meaning";
    case "MEANING_TO_TERM":
      return "Meaning → Word";
    default:
      return "Mixed";
  }
}
