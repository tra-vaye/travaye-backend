import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Create a transporter object
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.COMPANY_EMAIL}`,
    pass: `${process.env.APP_PASSWORD}`,
  },
});

// // Define the email message
// let message = {
//   from: "your_email@gmail.com",
//   to: "recipient_email@example.com",
//   subject: "Test Email",
//   text: "Hello, this is a test email!",
// };

// Send an email message using the authenticated transporter
export const sendVerifyEmail = (userEmail, code) => {
  transporter
    .sendMail({
      from: `${process.env.COMPANY_EMAIL}`,
      to: `${userEmail}`,
      subject: "Test Email",
      text: `Thank you for signing up to Travaye ✨✨. Here is your verification code ${code}`,
    })
    .then(console.log)
    .catch(console.error);
};
