/**
 * Shared email template wrapper for consistent, professional email formatting.
 * All outgoing emails should use this wrapper for brand consistency.
 */

const BRAND_NAME = "O'Prep";
const BRAND_COLOR = "#1e40af";
const BRAND_URL = "https://prepnmcn.com";
const SUPPORT_EMAIL = "hello@prepnmcn.com";
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Wraps email body content in a fully structured, responsive HTML email template.
 */
export function wrapEmailTemplate(options: {
  /** The inner HTML content to place in the email body */
  body: string;
  /** Optional pre-header text (shown in email preview) */
  preheader?: string;
  /** Optional footer override */
  footerHtml?: string;
}): string {
  const { body, preheader, footerHtml } = options;

  const preheaderBlock = preheader
    ? `<div style="display:none;font-size:1px;color:#f8f9fa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>`
    : "";

  const defaultFooter = `
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      <tr>
        <td style="padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
            Questions? Contact us at
            <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${SUPPORT_EMAIL}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
            <a href="${BRAND_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${BRAND_URL}</a>
          </p>
          <p style="margin:0;font-size:11px;color:#d1d5db;">
            &copy; ${CURRENT_YEAR} ${BRAND_NAME}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${BRAND_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    /* Base styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #374151;
      line-height: 1.6;
    }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">
  ${preheaderBlock}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" style="border-collapse:collapse;background-color:#f3f4f6;">
    <tr>
      <td style="padding:32px 16px;">
        <!-- Email container -->
        <table role="presentation" class="email-container" width="600" align="center" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:28px 40px 20px;text-align:center;background:linear-gradient(135deg,${BRAND_COLOR} 0%,#3b82f6 100%);">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${BRAND_NAME}</h1>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:0.5px;">Nursing Exam Prep Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:32px 40px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              ${footerHtml || defaultFooter}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Helper: Build a styled "code" block (for OTP codes).
 */
export function codeBlock(code: string): string {
  return `<div style="background-color:#f0f4ff;border:2px solid #dbeafe;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
    <span style="font-size:36px;font-weight:700;color:${BRAND_COLOR};letter-spacing:6px;font-family:'Courier New',Courier,monospace;">${code}</span>
  </div>`;
}

/**
 * Helper: Build a styled "quote" block (for showing user messages, feedback, etc.).
 */
export function quoteBlock(text: string, borderColor = BRAND_COLOR): string {
  return `<div style="background-color:#f9fafb;padding:16px 20px;border-radius:8px;margin:16px 0;border-left:4px solid ${borderColor};">
    <p style="margin:0;font-size:14px;color:#4b5563;font-style:italic;">${text}</p>
  </div>`;
}

/**
 * Helper: Build a styled "response/info" block.
 */
export function infoBlock(text: string, borderColor = "#3b82f6"): string {
  return `<div style="background-color:#eff6ff;padding:16px 20px;border-radius:8px;margin:16px 0;border-left:4px solid ${borderColor};">
    <p style="margin:0;font-size:14px;color:#374151;">${text}</p>
  </div>`;
}

/**
 * Helper: Build a CTA button.
 */
export function ctaButton(text: string, href: string): string {
  return `<table role="presentation" width="100%" style="border-collapse:collapse;">
    <tr>
      <td style="padding:24px 0;text-align:center;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:${BRAND_COLOR};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

/**
 * Helper: Paragraph with consistent styling.
 */
export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">${text}</p>`;
}

/**
 * Helper: Heading within email body.
 */
export function emailHeading(text: string, level: 2 | 3 = 2): string {
  const sizes = { 2: "20px", 3: "16px" };
  return `<h${level} style="margin:0 0 12px;font-size:${sizes[level]};font-weight:600;color:#111827;">${text}</h${level}>`;
}

/**
 * Helper: Signature block.
 */
export function signatureBlock(): string {
  return `<p style="margin:24px 0 0;font-size:14px;color:#6b7280;">
    Best regards,<br>
    <strong style="color:#374151;">The ${BRAND_NAME} Team</strong>
  </p>`;
}
