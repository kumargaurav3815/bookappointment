/** @format */

import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      subject: subject,
      text: message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    // console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    // console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
