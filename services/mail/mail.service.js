// import { google } from "googleapis";
// import nodemailer from "nodemailer";
// const OAuth2 = google.auth.OAuth2;

// // Create a new OAuth2 client using the generated client ID and secret
// const oauth2Client = new OAuth2(
//   `442012033769-oauvfa9fphibas909oh2dd1c90jdanbb.apps.googleusercontent.com`,
//   `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`,
//   "https://developers.google.com/oauthplayground"
// );

// // Set the refresh token for the OAuth2 client
// oauth2Client.setCredentials({
//   refresh_token: `1//04V-lNrE025H5CgYIARAAGAQSNwF-L9IrLtOGVphq96_lxn3_0onReVejwHLtMSnvKMmWodnpMUnJZ2s5zAX11qmzeHn1cbWXM3k`,
// });

// // Create a new transporter instance using Nodemailer and the OAuth2 client
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: `${process.env.COMPANY_EMAIL}`,
//     clientId: `442012033769-oauvfa9fphibas909oh2dd1c90jdanbb.apps.googleusercontent.com`,
//     clientSecret: `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`,
//     refreshToken: `1//04V-lNrE025H5CgYIARAAGAQSNwF-L9IrLtOGVphq96_lxn3_0onReVejwHLtMSnvKMmWodnpMUnJZ2s5zAX11qmzeHn1cbWXM3k`,
//     accessToken: oauth2Client.getAccessToken(),
//   },
// });

// // Send an email message using the authenticated transporter
// export const sendVerifyEmail = (userEmail, code) => {
//   transporter
//     .sendMail({
//       from: `${process.env.COMPANY_EMAIL}`,
//       to: `${userEmail}`,
//       subject: "Test Email",
//       text: `This is a test email sent using Nodemailer with OAuth2 authentication. And Here is your verification code ${code}`,
//     })
//     .then(console.log)
//     .catch(console.error);
// };
