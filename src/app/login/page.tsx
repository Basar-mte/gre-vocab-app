import Link from "next/link";
import LoginForm from "./login-form";
import GuestLoginForm from "./guest-login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string; reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="hero-band flex flex-1 flex-col items-center justify-center px-8 py-16 text-center md:px-14">
        <div className="relative flex max-w-sm flex-col items-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#D32C32] text-4xl font-bold text-white shadow-lg md:h-28 md:w-28 md:text-5xl">
            GE
          </span>
          <div className="hero-rule my-6" />
          <h1 className="page-title text-4xl md:text-5xl">GREasy</h1>
          <p className="mt-3 text-[#c9c5c1]">
            Flashcards, mnemonics, and exams built from one focused GRE vocabulary bank — study fast, remember
            longer.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold text-brand-900">Sign in</h2>
          <p className="mt-1 text-sm text-brand-700/70">Welcome back — pick up where you left off.</p>

          <div className="card mt-6 p-6">
            {params.registered && (
              <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                Account created. You can sign in now.
              </p>
            )}
            {params.reset && (
              <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                Password updated. Sign in with your new password.
              </p>
            )}
            <LoginForm callbackUrl={params.callbackUrl} />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand-700/50">
            <div className="h-px flex-1 bg-[#e3dfda]" />
            or
            <div className="h-px flex-1 bg-[#e3dfda]" />
          </div>

          <div className="card p-6">
            <GuestLoginForm callbackUrl={params.callbackUrl} />
          </div>

          <p className="mt-6 text-center text-sm text-brand-700/80">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
