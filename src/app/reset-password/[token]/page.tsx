import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/password-reset";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const tokenHash = hashResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  const valid = !!resetToken && !resetToken.usedAt && resetToken.expiresAt > new Date();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="hero-band flex flex-1 flex-col items-center justify-center px-8 py-16 text-center md:px-14">
        <div className="relative flex max-w-sm flex-col items-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#D32C32] text-4xl font-bold text-white shadow-lg md:h-28 md:w-28 md:text-5xl">
            GE
          </span>
          <div className="hero-rule my-6" />
          <h1 className="page-title text-4xl md:text-5xl">GREasy</h1>
          <p className="mt-3 text-[#c9c5c1]">Choose a new password to get back into your account.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] px-4 py-12">
        <div className="w-full max-w-md">
          {valid ? (
            <>
              <h2 className="text-xl font-bold text-brand-900">Set a new password</h2>
              <p className="mt-1 text-sm text-brand-700/70">Make it something you&apos;ll remember this time.</p>

              <div className="card mt-6 p-6">
                <ResetPasswordForm token={token} />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-brand-900">This link has expired</h2>
              <p className="mt-1 text-sm text-brand-700/70">
                Reset links are only valid for 1 hour, and can only be used once.
              </p>

              <div className="card mt-6 p-6">
                <Link href="/forgot-password" className="btn btn-primary w-full text-center">
                  Request a new link
                </Link>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-sm text-brand-700/80">
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
