import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailParams {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  await transporter.sendMail({
    from: (process.env.SMTP_FROM_NAME ?? "NEXUS") + " <" + (process.env.SMTP_FROM ?? "") + ">",
    to,
    subject,
    html,
  });
}

const EMAIL_HEADER = [
  "<!DOCTYPE html><html><head><meta charset=\"utf-8\">",
  "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head>",
  "<body style=\"margin:0;padding:0;background:#f5f5f6;font-family:system-ui,sans-serif;\">",
  "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding:40px 20px;\">",
  "<tr><td align=\"center\">",
  "<table width=\"480\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#fff;border-radius:16px;border:1px solid #e0e0e0;overflow:hidden;\">",
  "<tr><td style=\"padding:32px;text-align:center;border-bottom:1px solid #f0f0f0;\">",
  "<h1 style=\"margin:0;font-size:22px;font-weight:700;color:#171717;letter-spacing:-0.5px;\">NEXUS</h1>",
  "<p style=\"margin:4px 0 0;font-size:12px;color:#a0a0a0;\">by KyleDev Software Systems</p>",
  "</td></tr>",
].join("");

const EMAIL_FOOTER = [
  "<tr><td style=\"padding:20px 32px;text-align:center;background:#fafafa;border-top:1px solid #f0f0f0;\">",
  "<p style=\"margin:0;font-size:12px;color:#c4c4c4;\">NEXUS &mdash; KyleDev Software Systems &mdash; kyledev.site</p>",
  "</td></tr></table></td></tr></table></body></html>",
].join("");

export function otpEmailHtml(otp: string): string {
  const body = [
    "<tr><td style=\"padding:32px;text-align:center;\">",
    "<p style=\"margin:0 0 8px;font-size:15px;color:#545454;\">Your NEXUS sign-in code</p>",
    "<div style=\"display:inline-block;background:#f0f4ff;border-radius:12px;padding:20px 40px;margin:16px 0;\">",
    "<span style=\"font-size:36px;font-weight:700;letter-spacing:8px;color:#3d52e6;font-family:monospace;\">" + otp + "</span>",
    "</div>",
    "<p style=\"margin:16px 0 0;font-size:13px;color:#a0a0a0;\">This code expires in <strong>10 minutes</strong>.</p>",
    "<p style=\"margin:8px 0 0;font-size:13px;color:#a0a0a0;\">If you did not request this, you can safely ignore this email.</p>",
    "</td></tr>",
  ].join("");
  return EMAIL_HEADER + body + EMAIL_FOOTER;
}

export function magicLinkEmailHtml(url: string): string {
  const body = [
    "<tr><td style=\"padding:32px;text-align:center;\">",
    "<p style=\"margin:0 0 8px;font-size:15px;color:#545454;\">Click the button below to sign in to NEXUS.</p>",
    "<p style=\"margin:0 0 24px;font-size:13px;color:#a0a0a0;\">This link expires in <strong>15 minutes</strong> and can only be used once.</p>",
    "<a href=\"" + url + "\" style=\"display:inline-block;background:#3d52e6;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;\">Sign in to NEXUS</a>",
    "<p style=\"margin:24px 0 0;font-size:12px;color:#a0a0a0;\">Or copy this link:<br><span style=\"color:#3d52e6;word-break:break-all;\">" + url + "</span></p>",
    "<p style=\"margin:16px 0 0;font-size:13px;color:#a0a0a0;\">If you did not request this, you can safely ignore this email.</p>",
    "</td></tr>",
  ].join("");
  return EMAIL_HEADER + body + EMAIL_FOOTER;
}
