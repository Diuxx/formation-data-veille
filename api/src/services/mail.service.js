import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * 
 * @param {*} param0 
 * @returns 
 */
export async function sendEmail({ to, title, subject, html }) {
  return await transporter.sendMail({
    from: `${title} ${process.env.SMTP_FROM}`,
    to,
    subject,
    html,
  });
}