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