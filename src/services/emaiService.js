import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic reusable function
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Your Shop" <no-reply@yourshop.com>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw new Error("Email sending failed");
  }
};

// Verification email
export const sendVerificationEmail = async (email, link) => {
  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
  });
};

// Password reset email
export const sendPasswordResetEmail = async (email, link) => {
  return sendEmail({
    to: email,
    subject: "Reset your password",
    html: `<p>You requested a password reset.</p>
           <p>Click <a href="${link}">here</a> to reset your password.</p>`,
  });
};
