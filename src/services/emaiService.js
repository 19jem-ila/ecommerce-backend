import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Generic reusable function
// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: `"Your Shop" <no-reply@yourshop.com>`,
//       to,
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.error("❌ Email send failed:", err);
//     throw new Error("Email sending failed");
//   }
// };

// // Verification email
// export const sendVerificationEmail = async (email, link) => {
//   return sendEmail({
//     to: email,
//     subject: "Verify your email",
//     html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
//   });
// };

// // Password reset email
// export const sendPasswordResetEmail = async (email, link) => {
//   return sendEmail({
//     to: email,
//     subject: "Reset your password",
//     html: `<p>You requested a password reset.</p>
//            <p>Click <a href="${link}">here</a> to reset your password.</p>`,
//   });
// };


import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        timeout: 10000, // optional safety
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Brevo API email failed:",
      error.response?.data || error.message
    );

    // IMPORTANT: do NOT crash auth
    throw new Error("Email sending failed");
  }
};

// Verification email
export const sendVerificationEmail = async (email, link) => {
  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
      <p>Welcome to our  Shop 👋</p>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
    `,
  });
};

// Password reset email
export const sendPasswordResetEmail = async (email, link) => {
  return sendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click below to reset your password:</p>
      <a href="${link}">${link}</a>
    `,
  });
};
