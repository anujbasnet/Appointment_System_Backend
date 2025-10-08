import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import AppointmentModel from "../models/Appointment.js";
import Service from "../models/Service.js";
import Business from "../models/Business.js";

// Helper to extract user id
function extractUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET /api/appointments -> user appointments
export const getAppointments = async (req, res) => {
  const decoded = extractUser(req);
  if (!decoded) return res.status(401).json({ msg: "Unauthorized" });
  try {
    const docs = await AppointmentModel.find({ user_id: decoded.id }).sort({ created_at: -1 });
    res.status(200).json({ appointments: docs });
  } catch (e) {
    console.error("Error fetching appointments", e);
    res.status(500).json({ msg: "Server error" });
  }
};

// POST /api/appointments -> create
// body: { business_id, service_id, date (yyyy-mm-dd), time, specialist_id }
export const createAppointment = async (req, res) => {
  const decoded = extractUser(req);
  if (!decoded) return res.status(401).json({ msg: "Unauthorized" });
  const { business_id, service_id, date, time, specialist_id } = req.body;
  if (!business_id || !service_id || !date || !time) {
    return res.status(400).json({ msg: "business_id, service_id, date and time are required" });
  }
  try {
    // Optionally validate business/service existence
    const [serviceDoc, business] = await Promise.all([
      Service.findOne({ id: service_id }),
      Business.findOne({ id: business_id })
    ]);
    if (!business) return res.status(404).json({ msg: "Business not found" });

    // Try embedded services if standalone Service not present
    let service = serviceDoc;
    if (!service && Array.isArray(business.services)) {
      const embedded = business.services.find(s => String(s.id) === String(service_id));
      if (embedded) {
        // Create a lightweight shim object so downstream code can continue
        service = { id: embedded.id, name: embedded.name };
      }
    }
    if (!service) return res.status(404).json({ msg: "Service not found" });

    // Resolve specialist snapshot (optional)
    let specialist = null;
    if (specialist_id && Array.isArray(business.staff)) {
      const found = business.staff.find(s => s.id === specialist_id);
      if (found) {
        specialist = { id: found.id, name: found.name, title: found.title };
      }
    }

    const appt = await AppointmentModel.create({
      id: uuid(),
      user_id: decoded.id,
      business_id,
      service_id,
      date,
      time,
      status: "booked",
      specialist
    });
    res.status(201).json({ appointment: appt });
  } catch (e) {
    console.error("Error creating appointment", e);
    res.status(500).json({ msg: "Server error" });
  }
};

// PATCH /api/appointments/:id/status -> update status
export const updateAppointmentStatus = async (req, res) => {
  const decoded = extractUser(req);
  if (!decoded) return res.status(401).json({ msg: "Unauthorized" });
  const { id } = req.params;
  const { status } = req.body; // booked | canceled | completed
  if (!status || !["booked", "canceled", "completed"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status" });
  }
  try {
    const appt = await AppointmentModel.findOneAndUpdate({ id, user_id: decoded.id }, { status }, { new: true });
    if (!appt) return res.status(404).json({ msg: "Appointment not found" });
    res.status(200).json({ appointment: appt });
  } catch (e) {
    console.error("Error updating appointment status", e);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/appointments/availability?business_id=..&date=YYYY-MM-DD
// Returns { bookings: [{ time, specialist_id }] }
export const getAvailability = async (req, res) => {
  const { business_id, date } = req.query;
  if (!business_id || !date) return res.status(400).json({ msg: "business_id and date are required" });
  try {
    const appts = await AppointmentModel.find({ business_id, date, status: { $ne: 'canceled' } });
    const bookings = appts.map(a => ({ time: a.time, specialist_id: a.specialist?.id || null }));
    res.status(200).json({ bookings });
  } catch (e) {
    console.error('Error fetching availability', e);
    res.status(500).json({ msg: 'Server error' });
  }
};
