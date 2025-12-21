import nodemailer from "nodemailer";

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME;
const BASE_URL_FE = process.env.BASE_URL_FE;

// Create email transporter
const createTransporter = () => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP credentials are required. Please set SMTP_USER and SMTP_PASS environment variables."
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

/**
 * Send email verification email
 * @param to Recipient email address
 * @param name Recipient name
 * @param token Email verification token
 */
export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  const transporter = createTransporter();
  const verificationLink = `${BASE_URL_FE}/register/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - FTIP Unpad Alumni Club</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: left;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #006544; /* Maroon color for Unpad */
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #006544;
         color: #ffffff; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: left;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FTIP Unpad Alumni Club</div>
        </div>

        <h2>Selamat Datang, ${name}</h2>

        <p>Terima kasih telah mendaftar di FTIP Unpad Alumni Club. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>

        <div style="text-align: left;">
           <a href="${verificationLink}" style="display:inline-block; padding:12px 30px; background-color:#006544; color:#ffffff !important; text-decoration:none !important; border-radius:5px; font-weight:600;">
            Verifikasi Email
           </a>
        </div>

        <p>Atau Anda dapat menyalin dan menempelkan link berikut ke browser Anda:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>

        <p><strong>Link verifikasi akan kedaluwarsa dalam 24 jam.</strong></p>

        <p>Jika Anda tidak mendaftar untuk akun ini, Anda dapat mengabaikan email ini.</p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} FTIP Unpad Alumni Club<br>
          Pengurus Ikatan Alumni 2025-2029<br>
          Fakultas Teknologi Industri Pertanian<br>
          Universitas Padjadjaran</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject: "Verifikasi Email - FTIP Unpad Alumni Club",
    html: htmlContent,
  });
};

/**
 * Send password reset email
 * @param to Recipient email address
 * @param name Recipient name
 * @param token Password reset token
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  const transporter = createTransporter();
  const resetLink = `${BASE_URL_FE}/auth/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - FTIP Unpad Alumni Club</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: left;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #006544;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #006544;
         color: #ffffff; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: left;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FTIP Unpad Alumni Club</div>
        </div>

        <h2>Reset Password</h2>

        <p>Halo ${name},</p>

        <p>Kami menerima permintaan untuk reset password akun Anda. Untuk melanjutkan, silakan klik tombol di bawah ini:</p>

        <div style="text-align: left;">
          <a href="${resetLink}" style="display:inline-block; padding:12px 30px; background-color:#006544; color:#ffffff !important; text-decoration:none !important; border-radius:5px; font-weight:600;">Reset Password</a>
        </div>

        <p>Atau Anda dapat menyalin dan menempelkan link berikut ke browser Anda:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>

        <div class="warning">
          <p><strong>Link reset password akan kedaluwarsa dalam 1 jam.</strong></p>
          <p>Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini. Password Anda tidak akan berubah.</p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} FTIP Unpad Alumni Club<br>
          Pengurus Ikatan Alumni 2025-2029<br>
          Fakultas Teknologi Industri Pertanian<br>
          Universitas Padjadjaran</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject: "Reset Password - FTIP Unpad Alumni Club",
    html: htmlContent,
  });
};

/**
 * Send welcome email after successful email verification
 * @param to Recipient email address
 * @param name Recipient name
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<void> => {
  const transporter = createTransporter();
  const loginLink = `${BASE_URL_FE}/login`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Selamat Datang - FTIP Unpad Alumni Club</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: left;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #006544;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #006544;
          color: #ffffff; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .feature-list {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: left;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FTIP Unpad Alumni Club</div>
        </div>

        <h1>Selamat Datang, ${name}</h1>

        <p>Akun Anda telah berhasil diverifikasi. Anda sekarang dapat menikmati semua fitur yang tersedia di FTIP Unpad Alumni Club.</p>

        <div class="feature-list">
          <h3>Apa yang bisa Anda lakukan:</h3>
          <ul>
            <li>Membangun jaringan dengan alumni FTIP Unpad lainnya</li>
            <li>Mencari dan membagikan lowongan pekerjaan</li>
            <li>Mendaftarkan bisnis Anda di direktori bisnis alumni</li>
            <li>Update profil dan tetap terhubung dengan teman sefakultas</li>
          </ul>
        </div>

        <div style="text-align: left;">
          <a href="${loginLink}" style="display:inline-block; padding:12px 30px; background-color:#006544; color:#ffffff !important; text-decoration:none !important; border-radius:5px; font-weight:600;"">Login ke Akun Anda</a>
        </div>

        <p>Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi kami.</p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} FTIP Unpad Alumni Club<br>
          Pengurus Ikatan Alumni 2025-2029<br>
          Fakultas Teknologi Industri Pertanian<br>
          Universitas Padjadjaran</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject: "Selamat Datang di FTIP Unpad Alumni Club!",
    html: htmlContent,
  });
};
