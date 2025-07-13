/** @format */

import express from "express";
import { config } from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import appointmentRoutes from "./router/userRouter.js";
import consultationRoutes from "./router/userRouter.js";
import getAppointments from "./router/userRouter.js";
import getConsultations from "./router/userRouter.js";
import resetPassword from "./router/userRouter.js";
import requestPasswordReset from "./router/userRouter.js";
import userRouter from "./router/userRouter.js";
config({ path: "./config/config.env" });

// Create __dirname equivalent
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://bookappointmentonline.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // for preflight requests

// Initialize database connection
dbConnection();

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/getAppointments", getAppointments);
app.use("/api/v1/getConsultations", getConsultations);
app.put("/api/v1/user/reset-password/:token", resetPassword);

// // Serve static files from the frontend directory
// app.use(express.static(path.join(__dirname, "../frontend/dist")));

// // Serve the React app for reset-password route
// app.get("/reset-password/:token", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

// // Fallback route to serve React app
// Fallback route to serve React app
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

// Error handling middleware
app.use(errorMiddleware);

export default app;
