import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();

  const [setCount, wordCount, recentAttempts] = await Promise.all([
    prisma.vocabSet.count(),
    prisma.word.count(),
    prisma.examAttempt.findMany({
      where: { userId: user.id, mode: "EXAM", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="hero-band flex flex-wrap items-center justify-between gap-4 p-6 md:p-8">
        <div className="relative">
          <div className="hero-rule mb-3" />
          <h1 className="page-title text-2xl md:text-3xl">Welcome back, {user.name?.split(" ")[0]}</h1>
          <p className="mt-1 text-[#c9c5c1]">
            {setCount} sets &middot; {wordCount} words available to practice.
          </p>
        </div>
        <div className="relative flex gap-3">
          <div className="rounded-lg bg-white/10 px-4 py-2.5 text-center">
            <div className="font-serif text-xl font-bold text-white">{setCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-[#c9c5c1]">Sets</div>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-2.5 text-center">
            <div className="font-serif text-xl font-bold text-white">{wordCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-[#c9c5c1]">Words</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          href="/flashcards"
          title="Flashcards"
          description="Flip through terms and meanings at your own pace."
          cta="Study now"
          variant="accent"
        />
        <ActionCard
          href="/exam"
          title="Take an exam"
          description="Choose sets, a range, and how many words to be tested on."
          cta="Start exam"
          variant="dark"
        />
        <ActionCard
          href="/history"
          title="History"
          description="Review your past exam attempts and scores."
          cta="View history"
          variant="dark"
        />
        {user.role === "ADMIN" && (
          <ActionCard
            href="/admin"
            title="Admin Portal"
            description="Manage sets, words, users, and import CSV data."
            cta="Open admin"
            variant="accent"
          />
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Recent exam attempts</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-brand-700/70">
            No exams yet. <Link href="/exam" className="font-semibold text-brand-700 hover:underline">Take your first exam</Link>.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="table-ribbon">
                <tr>
                  <th className="table-head-cell">Date</th>
                  <th className="table-head-cell">Sets</th>
                  <th className="table-head-cell">Questions</th>
                  <th className="table-head-cell">Score</th>
                  <th className="table-head-cell" />
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-[#f1eeea] last:border-0 hover:bg-[#f9f7f6]">
                    <td className="px-4 py-2.5">{attempt.completedAt?.toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">{JSON.parse(attempt.setNumbers).join(", ")}</td>
                    <td className="px-4 py-2.5">{attempt.totalQuestions}</td>
                    <td className="px-4 py-2.5 font-semibold text-[#D32C32]">
                      {attempt.correctCount}/{attempt.totalQuestions} ({Math.round(attempt.scorePercent)}%)
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/exam/${attempt.id}/result`} className="font-semibold text-brand-700 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  cta,
  variant,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
  variant: "accent" | "dark";
}) {
  return (
    <Link
      href={href}
      className={`${variant === "accent" ? "card-accent" : "card-dark"} flex flex-col gap-2 p-5 transition hover:-translate-y-1 hover:shadow-xl`}
    >
      <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
      <p className="flex-1 text-sm text-white/75">{description}</p>
      <span className="text-sm font-bold text-white">{cta} →</span>
    </Link>
  );
}
