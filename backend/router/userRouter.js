/** @format */

import express from "express";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  bookAppointment,
  bookConsultation,
  getConsultations,
  getAppointments,
} from "../controller/userController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.put("/reset-password/:token", resetPassword);
router.post("/book", bookAppointment);
router.post("/book-consultation", bookConsultation);
router.get("/getAppointments", authenticate, getAppointments);
router.get("/getConsultations", authenticate, getConsultations);

export default router;
