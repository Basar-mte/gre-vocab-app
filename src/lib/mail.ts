import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Email is not configured — set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to enable password reset emails."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `GREasy <${from}>`,
    to,
    subject: "Reset your GREasy password",
    text: `Someone (hopefully you) requested a password reset for your GREasy account.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background:#111111; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <span style="display:inline-block; background:#D32C32; color:#fff; font-weight:bold; padding:8px 12px; border-radius:6px;">GE</span>
          <span style="color:#fff; font-weight:bold; font-size:18px; margin-left:10px;">GREasy</span>
        </div>
        <div style="border: 1px solid #e3dfda; border-top: none; padding: 24px; border-radius: 0 0 10px 10px;">
          <p>Someone (hopefully you) requested a password reset for your GREasy account.</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background:#D32C32; color:#fff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:bold;">Reset your password</a>
          </p>
          <p style="color:#6e6a66; font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
}
