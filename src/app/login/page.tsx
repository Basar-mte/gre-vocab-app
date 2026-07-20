import Link from "next/link";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D32C32] text-xl font-bold text-white">
            GE
          </div>
          <h1 className="page-title text-2xl text-brand-900">GREasy</h1>
          <p className="mt-1 text-sm text-brand-700/70">Flashcards &amp; exams for your word sets</p>
        </div>

        <div className="card p-6">
          {params.registered && (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Account created. You can sign in now.
            </p>
          )}
          <LoginForm callbackUrl={params.callbackUrl} />
        </div>

        <p className="mt-6 text-center text-sm text-brand-700/80">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
