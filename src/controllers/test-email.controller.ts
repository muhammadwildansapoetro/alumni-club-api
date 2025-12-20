import type { Request, Response } from "express";
import { createTransport } from "nodemailer";

export const testEmailController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Test connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Test Email - SMTP Configuration",
      text: "This is a test email to verify SMTP configuration works.",
      html: "<p>This is a test email to verify SMTP configuration works.</p>",
    });

    res.json({
      success: true,
      message: "Test email sent successfully!",
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
      }
    });
  } catch (error: any) {
    console.error("Email test error:", error);
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message,
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
      }
    });
  }
};