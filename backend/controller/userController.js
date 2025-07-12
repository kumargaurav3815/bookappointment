/** @format */

import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";
import { Appointment } from "../models/appointment.js";
import { Consultation } from "../models/Consultation.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const register = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, gender, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !gender || !password) {
    return next(new ErrorHandler("Please fill complete details!", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    gender,
    password,
    role: "Patient",
  });
  generateToken(user, "User Registered", 200, res);
  //   res.status(200).json({
  //     success: true,
  //     message: "User Registered!",
  //   });
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return next(new ErrorHandler("Please fill complete details!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password & Confirm Password Do Not Match!", 400)
    );
  }

  // Find the user by email and select the password for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  // Check if the provided password matches
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  // Generate and send the token
  generateToken(user, "Login Successful", 201, res);
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "EMAIL_USER",
    pass: "EMAIL_PASS",
  },
});

export const requestPasswordReset = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("No user found with this email!", 404));
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you have requested the reset of a password. Please click on the link below to reset your password:\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });
    res.status(200).json({
      success: true,
      message: "Email sent! Please check your inbox for further instructions.",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // console.log(`Reset password token: ${token}`);
  // console.log(`New password: ${password}`);

  if (!password) {
    return next(new ErrorHandler("Password is required", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    // console.log("No user found for the provided token.");
    return next(new ErrorHandler("Token is invalid or has expired", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  // console.log("Password reset successfully for user:", user.email);

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully!",
  });
});

export const bookAppointment = catchAsyncErrors(async (req, res, next) => {
  const { name, email, appointmentDate } = req.body;

  if (!name || !email || !appointmentDate) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  const existingAppointment = await Appointment.findOne({
    email,
    appointmentDate,
  });

  if (existingAppointment) {
    return next(
      new ErrorHandler(
        "An appointment with this email and date already exists!",
        400
      )
    );
  }

  const appointment = await Appointment.create({
    name,
    email,
    appointmentDate,
  });

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully!",
    appointment,
  });
});

export const bookConsultation = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    appointmentDate,
    appointmentTime,
    callType,
    prescriptionNeed,
  } = req.body;

  // Validate input fields
  if (!name || !email || !appointmentDate || !appointmentTime || !callType) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  // Check if a consultation with the same email, date, and time exists
  const existingConsultation = await Consultation.findOne({
    email,
    appointmentDate,
    appointmentTime,
  });

  if (existingConsultation) {
    return next(
      new ErrorHandler(
        "Consultation with this email, date, and time already exists!",
        400
      )
    );
  }

  // Create a new Consultation if no duplicates are found
  const consultation = await Consultation.create({
    name,
    email,
    appointmentDate,
    appointmentTime,
    callType,
    prescriptionNeed,
  });

  // Respond with success message
  res.status(201).json({
    success: true,
    message: "Consultation booked successfully!",
    consultation,
  });
});

export const getAppointments = catchAsyncErrors(async (req, res, next) => {
  try {
    const userEmail = req.user?.email; // Safely access email from req.user

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email not found. Please log in again.",
      });
    }

    // console.log("Fetching Appointments for userEmail:", userEmail);

    const appointments = await Appointment.find({ email: userEmail });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for the logged-in user.",
      });
    }

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    // console.error("Error fetching appointments:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching appointments.",
    });
  }
});

export const getConsultations = catchAsyncErrors(async (req, res, next) => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email not found. Please log in again.",
      });
    }

    console.log("Fetching Consultations for userEmail:", userEmail);

    const consultations = await Consultation.find({ email: userEmail });

    if (!consultations || consultations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No consultations found for the logged-in user.",
      });
    }

    res.status(200).json({
      success: true,
      consultations,
    });
  } catch (error) {
    // console.error("Error fetching consultations:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching consultations.",
    });
  }
});
