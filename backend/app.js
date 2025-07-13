/** @format */

import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import appointmentRoutes from "./router/userRouter.js";
import consultationRoutes from "./router/userRouter.js";
import getAppointments from "./router/userRouter.js";
import getConsultations from "./router/userRouter.js";
import resetPassword from "./router/userRouter.js";
import requestPasswordReset from "./router/userRouter.js";
import userRouter from "./router/userRouter.js";

// Load environment variables
config({ path: "./config/config.env" });

const app = express();

// Parse allowed origins from .env
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : [];

console.log("✅ Allowed Origins:", allowedOrigins);

// CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight support

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
dbConnection();

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/getAppointments", getAppointments);
app.use("/api/v1/getConsultations", getConsultations);
app.put("/api/v1/user/reset-password/:token", resetPassword);

// Error Middleware
app.use(errorMiddleware);

export default app;
