/** @format */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../config/config.env" });

// Generate a JWT for a user
export const generateToken = (user, message, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email, // Include email in the token payload
    },
    "medicare_2025", // Replace with your actual JWT secret
    { expiresIn: "1h" } // Set token expiration
  );

  // Send the token in the response
  res.status(statusCode).json({
    success: true,
    message,
    token,
  });
};
