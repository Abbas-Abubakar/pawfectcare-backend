import nodemailer from "nodemailer";
import { env } from "../config/env.js"

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  auth: {
    user: env.email.user,
    pass: env.email.pass
  }
})


transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

export const sendEmail = async({to, subject, html}) => {
  await transporter.sendMail({
    from: env.email.from,
    to, 
    subject,
    html
  })
}

export const sendOtpEmail = async(to, otp, name) => {
  await sendEmail({
    to,
    subject: "Verify your PawfectCare account",
    html: `
      <div style="max-width: 480px; margin: auto">
        <h2>Welcome to PawfectCare, ${name}!</h2>
        <p>Use to the code below to verify your account. This code expires in 5 minutes.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb">${otp}</p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
      </div>
    `
  })
}

export const sendPasswordresetEmail = async(to, resetUrl, name) => {
  await sendEmail({
    to,
    subject: "Reset your PawfectCare Password",
    html: `
      <div style="max-width: 480px; margin: auto">
        <h2>Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your password</p>
        <p>This link expires in 10 minutes. if you didn't request this, you can safely ignore this email.</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 24px 12px; background: #2563eb; color: #fff text-decoration: none; border-radius: 6px; margin-top: 12px;">Reset Password</a>
        <p style="margin-top: 12px;font-size: 12px; color: #666">Or copy this link ${resetUrl}</p>
      </div>
    `
  })
}