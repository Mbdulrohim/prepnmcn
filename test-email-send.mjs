import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
async function testEmail() {
  console.log("Testing email configuration...");
  console.log("SMTP Host:", process.env.SMTP_HOST);
  console.log("SMTP Port:", process.env.SMTP_PORT);
  console.log("SMTP User:", process.env.SMTP_USER ? "Set" : "Not set");
  console.log("SMTP Password:", process.env.SMTP_PASSWORD ? "Set" : "Not set");
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
      rejectUnauthorized: false,
    },
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection successful!");
    // Send test email to doyextech@gmail.com from notifications
    const info = await transporter.sendMail({
      from: `"${process.env.LOGIN_NOTIFICATION_SENDER_NAME}" <${process.env.LOGIN_NOTIFICATION_FROM_EMAIL}>`,
      to: "doyextech@gmail.com",
      subject: "Test Notification from O'Prep",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔔 O'Prep Notification Test</h2>
          <p>Hello!</p>
          <p>This is a test notification email from the O'Prep platform.</p>
          <p>If you're receiving this, the email notification system is working correctly!</p>
          <br>
          <p style="color: #6b7280; font-size: 14px;">
            Sent from: ${process.env.LOGIN_NOTIFICATION_FROM_EMAIL}<br>
            Timestamp: ${new Date().toLocaleString()}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            O'Prep - Your Ultimate Exam Preparation Platform
          </p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error("Error:", error && error.message ? error.message : error);
    console.error("Code:", error && error.code ? error.code : undefined);
    console.error(error);
  }
}

testEmail();
