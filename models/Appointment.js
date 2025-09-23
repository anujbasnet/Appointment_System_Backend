import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  businessId: { type: String },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: Date, required: true },
  status: { type: String, default: "upcoming" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Appointment", appointmentSchema);
