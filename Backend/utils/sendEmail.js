import { transporter, emailConfig } from '../config/emailConfig.js';

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    return false;
  }
};

// Forgot Password Email Template
export const sendForgotPasswordEmail = async (to, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2ef4ff; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #2ef4ff; }
        .title { font-size: 20px; color: #333; margin: 20px 0; }
        .button { display: inline-block; background: #2ef4ff; color: #0a0f1a; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        .warning { color: #ff4444; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏢 IDA ERP CRM</div>
        </div>
        <div class="title">Reset Your Password</div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password for your IDA ERP CRM account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p class="warning">⚠️ This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <div class="footer">
          <p>© 2024 IDA ERP CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail(to, 'Reset Your IDA ERP CRM Password', html);
};

// Password Changed Success Email
export const sendPasswordChangedEmail = async (to, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2ef4ff; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #2ef4ff; }
        .success { color: #10b981; font-size: 48px; text-align: center; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏢 IDA ERP CRM</div>
        </div>
        <div class="success">✓</div>
        <div class="title">Password Changed Successfully!</div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your IDA ERP CRM account password has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <div class="footer">
          <p>© 2024 IDA ERP CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail(to, 'Password Changed Successfully', html);
};

// ============================================
// NEW: Welcome Email for Student Admission
// ============================================
export const sendWelcomeEmail = async (email, name, password, enrollmentId) => {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; border-bottom: 2px solid #ec4899; padding-bottom: 20px; margin-bottom: 20px; }
                .logo { font-size: 24px; font-weight: bold; color: #ec4899; }
                .title { font-size: 20px; color: #333; margin: 20px 0; }
                .credentials { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
                .button { display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏢 IDA ERP CRM</div>
                </div>
                <div class="title">Welcome to IDA ERP CRM!</div>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your admission has been successfully completed. Your student account has been created.</p>
                <div class="credentials">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please change your password after first login for security purposes.</p>
                <div style="text-align: center;">
                    <a href="${loginUrl}" class="button">Login to Dashboard</a>
                </div>
                <div class="footer">
                    <p>© 2024 IDA ERP CRM. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return await sendEmail(email, 'Welcome to IDA ERP CRM - Your Account Created', html);
};