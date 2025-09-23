import jwt from "jsonwebtoken";
import * as mongoHelper from "../utils/mongoHelper.js";

// Get all appointments for the logged-in user
export const getAppointments = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch only appointments for this user directly from MongoDB
    const userAppointments = await mongoHelper.Appointment.find({ userId: decoded.id });

    res.status(200).json({ appointments: userAppointments });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(401).json({ msg: "Invalid token or server error" });
  }
};

// Create a new appointment for the logged-in user
export const createAppointment = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, date, description, status } = req.body;

    const newAppointment = {
      userId: decoded.id,
      title,
      date,
      description: description || "",
      status: status || "upcoming",
      createdAt: new Date(),
    };

    const savedAppointment = await mongoHelper.addAppointment(newAppointment);
    res.status(201).json({ appointment: savedAppointment });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
