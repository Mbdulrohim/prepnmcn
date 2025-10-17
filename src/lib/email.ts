// Email queue to handle bursts
interface EmailJob {
  options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
  };
  retries: number;
  resolve: (value: { success: boolean; error?: string }) => void;
  reject: (reason: any) => void;
}

const emailQueue: EmailJob[] = [];
let isProcessingQueue = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function processEmailQueue() {
  if (isProcessingQueue || emailQueue.length === 0) return;

  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const job = emailQueue.shift()!;
    try {
      const result = await sendEmailImmediate(job.options);
      job.resolve(result);
    } catch (error) {
      job.retries++;
      if (job.retries < MAX_RETRIES) {
        // Retry with delay
        setTimeout(() => {
          emailQueue.unshift(job);
        }, RETRY_DELAY * job.retries);
      } else {
        job.reject(error);
      }
    }

    // Small delay between emails to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  isProcessingQueue = false;
}

async function sendEmailViaSMTP(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    (await import("dotenv")).config();
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      requireTLS: process.env.SMTP_PORT !== "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized:
          process.env.NODE_ENV === "production" ? true : false,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
    });

    // prefer explicit text if provided, otherwise generate a simple plain-text fallback
    const plainText =
      options.text ||
      (options.html ? options.html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "");

    const mailOptions: any = {
      from: options.from || process.env.SMTP_FROM_EMAIL || "noreply@prepnmcn.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: plainText,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err: any) {
    console.error("SMTP send failed:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

async function sendEmailImmediate(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Fallback: send directly via SMTP (nodemailer)
  const smtpResult = await sendEmailViaSMTP(options as any);
  if (smtpResult.success) return smtpResult;
  return { success: false, error: smtpResult.error || "SMTP send failed" };
}

function queueEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve, reject) => {
    const job: EmailJob = {
      options,
      retries: 0,
      resolve,
      reject,
    };

    emailQueue.push(job);
    processEmailQueue();
  });
}

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"${process.env.LOGIN_CODE_SENDER_NAME || "O'Prep Login"}" <${
      process.env.LOGIN_CODE_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      "noreply@prepnmcn.com"
    }>`,
    to: email,
    subject: "Your O'Prep Login Code",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your O'Prep Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .code {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 4px;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">

          <h1 style="text-align: center; color: #333; margin-bottom: 10px;">Welcome to O'Prep!</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">Use this code to sign in to your account</p>

          <div class="code">
            ${code}
          </div>

          <p style="text-align: center; color: #666; margin-bottom: 20px;">
            This code will expire in 10 minutes for your security.
          </p>

          <p style="text-align: center; color: #666;">
            If you didn't request this code, you can safely ignore this email.
          </p>

          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:hello@prepnmcn.com" style="color: #007bff;">hello@oprep.com</a></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
              © 2025 O'Prep. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log("Queueing verification email to:", email);

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your O'Prep Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .code {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 4px;
            margin: 30px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">

          <h1 style="text-align: center; color: #333; margin-bottom: 10px;">Welcome to O'Prep!</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">Use this code to sign in to your account</p>

          <div class="code">
            ${code}
          </div>

          <p style="text-align: center; color: #666; margin-bottom: 20px;">
            This code will expire in 10 minutes for your security.
          </p>

          <p style="text-align: center; color: #666;">
            If you didn't request this code, you can safely ignore this email.
          </p>

          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:hello@prepnmcn.com" style="color: #007bff;">hello@oprep.com</a></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
              © 2025 O'Prep. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = htmlBody.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    return await queueEmail({
      to: email,
      subject: "Your O'Prep Login Code",
      html: htmlBody,
      text: textBody,
    });
  } catch (error) {
    console.error("Email queuing failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Generate a 6-digit random code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generic email sending function
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    console.log("Queueing email to:", options.to);
    return await queueEmail(options);
  } catch (error) {
    console.error("Email queuing failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Specialized email functions for different types
export async function sendLoginCodeEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${process.env.LOGIN_CODE_SENDER_NAME || "O'Prep Login"}" <${
    process.env.LOGIN_CODE_FROM_EMAIL || process.env.SMTP_FROM_EMAIL
  }>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendLoginNotificationEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${
    process.env.LOGIN_NOTIFICATION_SENDER_NAME || "O'Prep Security"
  }" <${
    process.env.LOGIN_NOTIFICATION_FROM_EMAIL || process.env.SMTP_FROM_EMAIL
  }>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendFeedbackEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${process.env.FEEDBACK_SENDER_NAME || "O'Prep Feedback"}" <${
    process.env.FEEDBACK_FROM_EMAIL || process.env.SMTP_FROM_EMAIL
  }>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendAdminNotificationEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${
    process.env.ADMIN_NOTIFICATION_SENDER_NAME || "O'Prep Admin"
  }" <${
    process.env.ADMIN_NOTIFICATION_FROM_EMAIL || process.env.SMTP_FROM_EMAIL
  }>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendWelcomeEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${process.env.WELCOME_SENDER_NAME || "O'Prep Team"}" <${
    process.env.WELCOME_FROM_EMAIL || process.env.SMTP_FROM_EMAIL
  }>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendReminderEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${
    process.env.REMINDER_SENDER_NAME || "O'Prep Study Buddy"
  }" <${process.env.REMINDER_FROM_EMAIL || process.env.SMTP_FROM_EMAIL}>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendAchievementEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${
    process.env.ACHIEVEMENT_SENDER_NAME || "O'Prep Achievements"
  }" <${process.env.ACHIEVEMENT_FROM_EMAIL || process.env.SMTP_FROM_EMAIL}>`;

  return sendEmail({
    ...options,
    from,
  });
}

export async function sendNewsletterEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"${process.env.NEWSLETTER_SENDER_NAME || "O'Prep Updates"}" <${
    process.env.NEWSLETTER_FROM_EMAIL || process.env.SMTP_FROM_EMAIL
  }>`;

  return sendEmail({
    ...options,
    from,
  });
}
