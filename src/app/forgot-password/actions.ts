"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/mail";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export type ForgotPasswordState = {
  error?: string;
  success?: boolean;
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email address." };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always report success, whether or not the account exists, so this
  // can't be used to enumerate registered emails.
  if (!user) {
    return { success: true };
  }

  const { token, tokenHash } = generateResetToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = process.env.NEXTAUTH_URL || (host ? `${protocol}://${host}` : "");
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { error: "We couldn't send the reset email right now. Please try again shortly." };
  }

  return { success: true };
}
