const nodemailer = require("nodemailer");

// ------------------- Config -------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

// ------------------- Send Email Function -------------------
async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"Luminous Garden" <${process.env.NODEMAILER_USER}>`,
      to,
      subject,
      text: text || "",
      html: html || "",
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    throw err;
  }
}

async function sendWelcomeEmail(user) {
  if (!user?.email || !user?.name) return;

  const subject = `🌱 Welcome to Luminous Garden, ${user?.name}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
      <h2 style="color: #2E8B57;">Hello ${user?.name},</h2>
      <p>Thank you for joining <strong>Luminous Garden</strong>! 🎉</p>
      <p>You can now explore plant care tips, buy your favorite plants, and enjoy a greener home.</p>
      <p style="margin-top:20px;">🌿 Let's grow together!</p>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
}
module.exports = { sendEmail, sendWelcomeEmail };
