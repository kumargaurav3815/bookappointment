/** @format */

import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
});

// export const Appointment = mongoose.model("Appointment", appointmentSchema);
export const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema,
  "appointments"
);
export default Appointment;
