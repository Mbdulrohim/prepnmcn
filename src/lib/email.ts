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

    const allowSelfSigned =
      process.env.SMTP_ALLOW_SELF_SIGNED === "true" ||
      process.env.SMTP_ALLOW_SELF_SIGNED === "1" ||
      process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0";

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
          process.env.NODE_ENV === "production" && !allowSelfSigned,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
    });

    // prefer explicit text if provided, otherwise generate a simple plain-text fallback
    const plainText =
      options.text ||
      (options.html
        ? options.html
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim()
        : "");

    const mailOptions: any = {
      from:
        options.from || process.env.SMTP_FROM_EMAIL || "noreply@prepnmcn.com",
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
  try {
    console.log("Queueing verification email to:", email);

    const { wrapEmailTemplate, codeBlock, emailParagraph } =
      await import("./email-template");

    const htmlBody = wrapEmailTemplate({
      preheader: `Your O'Prep login code is ${code}`,
      body: `
        ${emailParagraph("Use the code below to sign in to your <strong>O'Prep</strong> account:")}
        ${codeBlock(code)}
        ${emailParagraph("This code will expire in <strong>10 minutes</strong> for your security.")}
        ${emailParagraph("If you didn't request this code, you can safely ignore this email.")}
      `,
    });

    const textBody = `Your O'Prep login code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`;

    const from = `"${process.env.LOGIN_CODE_SENDER_NAME || "O'Prep Login"}" <${
      process.env.LOGIN_CODE_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      "noreply@prepnmcn.com"
    }>`;

    return await queueEmail({
      from,
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
