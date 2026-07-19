import Link from "next/link";
import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
            GV
          </div>
          <h1 className="text-2xl font-bold text-brand-900">Create your account</h1>
          <p className="mt-1 text-sm text-brand-700/70">
            Start practicing GRE vocabulary with flashcards and exams.
          </p>
        </div>

        <div className="card p-6">
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
  );
}
