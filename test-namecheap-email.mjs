import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testNamecheapEmail() {
  console.log("Testing Namecheap email configuration...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Namecheap SMTP connection successful!");

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: "doyextech@gmail.com",
      subject: "PREPNMCN - Professional Email Template Test",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PREPNMCN Email Template Test</title>
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
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .header { padding: 30px 20px !important; }
              .content { padding: 30px 20px !important; }
              .code-container { padding: 20px !important; }
              .code { font-size: 28px !important; letter-spacing: 6px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">

          <!-- Email Container -->
          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0; padding: 20px 0;">
            <tr>
              <td style="text-align: center;">

                <!-- Main Email Card -->
                <table class="container" role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">

                  <!-- Header Section -->
                  <tr>
                    <td class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #312e81 100%); padding: 40px 30px; text-align: center; position: relative;">
                      <!-- Logo/Brand -->
                      <div style="background: rgba(255, 255, 255, 0.1); display: inline-block; padding: 12px 24px; border-radius: 50px; margin-bottom: 16px; backdrop-filter: blur(10px);">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                          PREPNMCN
                        </h1>
                      </div>
                      <p style="color: #ddd6fe; margin: 0; font-size: 16px; font-weight: 400; opacity: 0.9;">
                        Nursing & Medical Council of Nigeria
                      </p>
                      <p style="color: #c7d2fe; margin: 8px 0 0 0; font-size: 14px; font-weight: 300;">
                        Email Template Test
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td class="content" style="padding: 50px 40px;">

                      <!-- Welcome Message -->
                      <div style="text-align: center; margin-bottom: 40px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 24px; margin-bottom: 20px;">
                          ✅
                        </div>
                        <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          Email Test Successful!
                        </h2>
                        <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                          Your professional email template is working perfectly
                        </p>
                      </div>

                      <!-- Success Message -->
                      <div class="code-container" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 16px; padding: 30px; text-align: center; margin: 40px 0; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%); pointer-events: none;"></div>
                        <p style="color: #166534; margin: 0 0 16px 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                          Connection Status
                        </p>
                        <div style="font-size: 36px; font-weight: 800; color: #15803d; letter-spacing: 2px; font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; position: relative;">
                          CONNECTED
                        </div>
                        <p style="color: #166534; margin: 16px 0 0 0; font-size: 12px;">
                          Namecheap SMTP configuration verified
                        </p>
                      </div>

                      <!-- Feature Notice -->
                      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 30px 0; position: relative;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                          <div style="color: #1d4ed8; font-size: 18px; margin-top: 2px;">🎨</div>
                          <div>
                            <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                              Professional Design Template Active
                            </p>
                            <p style="color: #3730a3; margin: 0; font-size: 13px; line-height: 1.4;">
                              This email demonstrates the new professional template design with responsive layout, modern gradients, and email client compatibility.
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Action Button -->
                      <div style="text-align: center; margin: 40px 0 30px 0;">
                        <a href="https://prepnmcn.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
                          Visit PREPNMCN Platform →
                        </a>
                      </div>

                      <!-- Help Text -->
                      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                          This is a test email to verify the professional template design.
                        </p>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center;">

                            <!-- Social Links -->
                            <div style="margin-bottom: 20px;">
                              <a href="https://prepnmcn.com" style="display: inline-block; margin: 0 8px; padding: 8px; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                <span style="color: #3b82f6; font-size: 16px;">🌐</span>
                              </a>
                              <a href="mailto:hello@prepnmcn.com" style="display: inline-block; margin: 0 8px; padding: 8px; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                <span style="color: #3b82f6; font-size: 16px;">📧</span>
                              </a>
                            </div>

                            <!-- Contact Info -->
                            <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">
                              Need help? Contact us at
                              <a href="mailto:hello@prepnmcn.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">hello@prepnmcn.com</a>
                            </p>

                            <!-- Company Info -->
                            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                              PREPNMCN - Empowering Healthcare Professionals
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

                <!-- Disclaimer -->
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 20px auto 0;">
                  <tr>
                    <td style="text-align: center; padding: 0 20px;">
                      <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
                        This is a test email from PREPNMCN. The professional email template is now active.
                        <br>
                        Template designed for optimal rendering across all email clients.
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

        </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Namecheap email test failed:", error.message);
    console.error("Error code:", error.code);

    if (error.code === "EAUTH") {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check your email address and password");
      console.log(
        "2. Make sure your domain is properly configured in Namecheap"
      );
      console.log("3. Verify your email account is active");
    }
  }
}

testNamecheapEmail();
