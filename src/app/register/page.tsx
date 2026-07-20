import Link from "next/link";
import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="hero-band flex flex-1 flex-col justify-center px-8 py-16 md:px-14">
        <div className="relative max-w-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D32C32] text-xl font-bold text-white">
            GE
          </span>
          <div className="hero-rule my-5" />
          <h1 className="page-title text-3xl md:text-4xl">Join GREasy</h1>
          <p className="mt-3 text-[#c9c5c1]">
            Start practicing GRE vocabulary with flashcards and exams built for focused, repeatable study.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold text-brand-900">Create your account</h2>
          <p className="mt-1 text-sm text-brand-700/70">Takes less than a minute.</p>

          <div className="card mt-6 p-6">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-brand-700/80">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
