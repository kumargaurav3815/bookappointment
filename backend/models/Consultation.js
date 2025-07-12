/** @format */

import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    callType: { type: String, enum: ["video", "audio"], required: true },
    prescriptionNeed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "consultations" } // Explicitly specify the collection name
);

export const Consultation = mongoose.model("Consultation", consultationSchema);

export default Consultation;
