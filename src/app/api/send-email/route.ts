import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = "nodejs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  requireTLS: process.env.SMTP_PORT !== '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10,
});

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, from } = await req.json();

    const mailOptions = {
      from: from || process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@oprep.com',
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        code: (error as Error & { code?: string | number }).code,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}