import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
export const sendEmailService = async (email, appointmentDetails) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"Hệ thống đặt lịch khám bệnh" <lieudienfcthon3@gmail.com>',
    to: email,
    subject: "Appointment Confirmation",
    text: `Your appointment is confirmed.\n\nDetails:\n${appointmentDetails}`,
    html: `
      <p><strong>Thank you for booking an appointment at Medical Care's system</strong></p>
      <p><strong>Information for booked appointment:</strong></p>
      <p>${appointmentDetails.replace(/\n/g, "<br>")}</p>
      <p><strong>Medical Care system will automatically send email notification when confirmed appointment is complete. Thank you!</strong></p>
    `,
  });

  return info;
};

export const sendPasswordResetEmail = async ({ email, html }) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"Hệ thống đặt lịch khám bệnh" <lieudienfcthon3@gmail.com>',
    to: email,
    subject: "Password Reset Request",
    html: html,
  });

  return info;
};

export const sendAppointmentReminderEmail = async (
  email,
  appointmentDetails
) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"Medical Booking System" <lieudienfcthon3@gmail.com>',
    to: email,
    subject: "Appointment Reminder",
    text: `Your appointment is scheduled to start in 30 minutes.\n\nDetails:\n${appointmentDetails}`,
    html: `
      <p><strong>Your appointment is scheduled to start in 30 minutes.</strong></p>
      <p><strong>Details:</strong></p>
      <p>${appointmentDetails.replace(/\n/g, "<br>")}</p>
    `,
  });

  return info;
};

export const sendAppointmentConfirmationEmail = async (
  email,
  appointmentDetails
) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"Medical Booking System" <your-email@gmail.com>',
    to: email,
    subject: "Appointment Confirmed",
    text: `Your appointment has been confirmed by the doctor.\n\nDetails:\n${appointmentDetails}`,
    html: `
      <p><strong>Your appointment has been confirmed by the doctor.</strong></p>
      <p><strong>Details:</strong></p>
      <p>${appointmentDetails.replace(/\n/g, "<br>")}</p>
    `,
  });

  return info;
};
