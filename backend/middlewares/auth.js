/** @format */

//authentication so that everyone can't register as admin (only admin can register new admin)
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
// import ErrorHandler from "./error.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import jwt from "jsonwebtoken";

// Middleware to authenticate dashboard users
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  //get adminToken
  const token = req.cookies.adminToken;
  //if adminToken not found
  if (!token) {
    return next(new ErrorHandler("Admin not authenticated!", 400));
  }
  //if adminToken found
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  if (req.user.role !== "Admin") {
    return next(
      new ErrorHandler(
        `${req.user.role} not authorized for this resource!`,
        403
      )
    );
  }
  next();
});

// Middleware to authenticate frontend users
export const isPatientAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.patientToken;
    if (!token) {
      return next(new ErrorHandler("User is not authenticated!", 400));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Patient") {
      return next(
        new ErrorHandler(
          `${req.user.role} not authorized for this resource!`,
          403
        )
      );
    }
    next();
  }
);

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify the token and extract the payload
    const decoded = jwt.verify(token, "medicare_2025"); // Replace with your actual secret
    // console.log("Decoded User from Token:", decoded);

    req.user = decoded; // Attach the decoded data to req.user
    next(); // Pass control to the next middleware/handler
  } catch (error) {
    // console.error("Token verification error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
