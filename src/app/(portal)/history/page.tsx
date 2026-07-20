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
      <div className="hero-band p-6 md:p-8">
        <div className="relative">
          <div className="hero-rule mb-3" />
          <h1 className="page-title text-2xl md:text-3xl">Exam history</h1>
          <p className="mt-1 text-[#c9c5c1]">All of your completed exam attempts.</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
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
            <thead className="table-ribbon">
              <tr>
                <th className="table-head-cell">Date</th>
                <th className="table-head-cell">Sets</th>
                <th className="table-head-cell">Direction</th>
                <th className="table-head-cell">Style</th>
                <th className="table-head-cell">Score</th>
                <th className="table-head-cell" />
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="border-b border-[#f1eeea] last:border-0 hover:bg-[#f9f7f6]">
                  <td className="px-4 py-3">{attempt.completedAt?.toLocaleString()}</td>
                  <td className="px-4 py-3">{JSON.parse(attempt.setNumbers).join(", ")}</td>
                  <td className="px-4 py-3">{formatDirection(attempt.direction)}</td>
                  <td className="px-4 py-3">{attempt.format === "MULTIPLE_CHOICE" ? "Multiple choice" : "Typed"}</td>
                  <td className="px-4 py-3 font-semibold text-[#D32C32]">
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
