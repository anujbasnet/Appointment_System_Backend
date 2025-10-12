import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import AppointmentModel from "../models/Appointment.js";
import Service from "../models/Service.js";
import Business from "../models/Business.js";
import { sendBusinessAppointmentEmail, sendCustomerAppointmentStatusEmail } from "../utils/mailer.js";
import User from "../models/User.js";

// Helper to extract user from JWT (align secret with login fallback)
function extractUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'secret123';
    return jwt.verify(token, secret);
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

// GET /api/appointments/business -> appointments for authenticated business (or by query businessId)
export const getBusinessAppointments = async (req, res) => {
  // Allow read-only access when explicit businessId is provided via query without requiring Authorization header
  const explicitBusinessId = req.query.businessId || req.query.business_id;
  let decoded = null;
  if (req.headers.authorization) {
    decoded = extractUser(req);
  }
  // If neither explicit businessId nor a valid token is provided, reject
  if (!explicitBusinessId && !decoded) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  const businessId = explicitBusinessId || decoded?.id || decoded?._id || decoded?.user_id;
  if (!businessId) {
    return res.status(400).json({ msg: 'businessId is required' });
  }
  try {
    // Build query filter
    const filter = { business_id: String(businessId) };
    // Debug: log first 5 appointments for this business before status filtering
    const preStatusDocs = await AppointmentModel.find({ business_id: String(businessId) }).limit(5).lean();
    console.log('[DEBUG] First 5 appointments for business_id', businessId, ':', preStatusDocs.map(a => ({ id: a._id, status: a.status })));
    if (req.query.status) {
      // Support comma-separated status values
      const statusList = String(req.query.status).split(',').map(s => s.trim()).filter(Boolean);
      if (statusList.length === 1) {
        filter.status = statusList[0];
      } else if (statusList.length > 1) {
        filter.status = { $in: statusList };
      }
    }
    // Fetch appointments and populate user (client) details
    const docs = await AppointmentModel.find(filter)
      .sort({ created_at: -1 })
      .lean();
    console.log('[getBusinessAppointments] businessId:', businessId, '| status:', req.query.status, '| filter:', filter);
    console.log('[getBusinessAppointments] found appointments:', docs.length);

    // Fetch all user_ids in appointments
    const userIds = docs.map(a => a.user_id).filter(Boolean);
    const users = await User.find({ id: { $in: userIds } }).select('id name email phone');
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    // Fetch business and build serviceId->serviceName map
    const business = await Business.findOne({ id: businessId });
    let serviceNameMap = {};
    if (business && Array.isArray(business.services)) {
      business.services.forEach(s => {
        if (s.id && (s.name || s.service_name)) {
          serviceNameMap[String(s.id)] = s.name || s.service_name;
        }
      });
    }
    // Attach user details and service name to each appointment
    const enriched = docs.map(a => ({
      ...a,
      client: userMap[a.user_id] || null,
      service: {
        id: a.service_id,
        name: serviceNameMap[String(a.service_id)] || a.service_id
      }
    }));
    res.status(200).json({ appointments: enriched });
  } catch (e) {
    console.error('Error fetching business appointments', e);
    res.status(500).json({ msg: 'Server error' });
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
      status: "waiting",
      specialist
    });
    // Attempt to email the business
    try {
      const to = business.email;
      if (to) {
        await sendBusinessAppointmentEmail({
          to,
          businessName: business.full_name || business.service_name,
          serviceName: (service && (service.name || service.service_name)) || 'Service',
          customerName: decoded?.name || decoded?.email || 'Customer',
          date,
          time,
          specialistName: specialist?.name
        });
      }
    } catch (mailErr) {
      console.warn('Email notification failed but appointment created', mailErr);
    }
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
  if (!status || !["waiting", "notbooked", "booked", "canceled", "completed"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status" });
  }
  try {
    // Allow both customer and business to update: match on user_id or business_id based on token
    const filter = (decoded.user_type === 'business')
      ? { id, business_id: decoded.id }
      : { id, user_id: decoded.id };
    const appt = await AppointmentModel.findOneAndUpdate(filter, { status }, { new: true });
    if (!appt) return res.status(404).json({ msg: "Appointment not found" });
    // Attempt to email the customer on accept/decline
    try {
      if (status === 'booked' || status === 'canceled') {
        // Load business and user to extract names/emails
        const [business, user] = await Promise.all([
          Business.findOne({ id: appt.business_id }),
          User.findOne({ id: appt.user_id })
        ]);
        const to = user?.email;
        if (to) {
          await sendCustomerAppointmentStatusEmail({
            to,
            customerName: user?.full_name || user?.name || undefined,
            businessName: business?.full_name || business?.service_name || undefined,
            serviceName: appt.service_id, // could be enhanced to resolve service name
            date: appt.date,
            time: appt.time,
            status
          });
        }
      }
    } catch (mailErr) {
      console.warn('Customer email notification failed', mailErr);
    }
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
    // Treat both 'waiting' and 'booked' as blocking availability
    const appts = await AppointmentModel.find({ business_id, date, status: { $in: ['waiting','booked'] } });
    const bookings = appts.map(a => ({ time: a.time, specialist_id: a.specialist?.id || null }));
    res.status(200).json({ bookings });
  } catch (e) {
    console.error('Error fetching availability', e);
    res.status(500).json({ msg: 'Server error' });
  }
};
