import mongoose from "mongoose";

// New unified Appointment schema per requirements
// Fields:
//  id (string, unique public identifier)
//  user_id (customer making the booking)
//  business_id (business providing the service)
//  service_id (booked service)
//  date (YYYY-MM-DD)
//  time (HH:mm or formatted string)
//  status (booked | canceled | completed)
//  specialist (embedded snapshot of staff member or at least id/name)
//  created_at timestamp

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  business_id: { type: String, required: true },
  service_id: { type: String, required: true },
  date: { type: String, required: true }, // store as ISO date string (yyyy-mm-dd) for simple querying
  time: { type: String, required: true }, // store raw time label (e.g. "10:00 AM")
  status: { type: String, enum: ["waiting", "notbooked", "booked", "canceled", "completed"], default: "waiting" },
  specialist: {
    id: String,
    name: String,
    title: String,
  },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Appointment", appointmentSchema);
