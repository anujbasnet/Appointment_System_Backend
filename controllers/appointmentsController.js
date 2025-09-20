import jwt from "jsonwebtoken";
import { readAppointments, writeAppointments } from "../utils/fileHelper.js";

export const getAppointments = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const appointments = readAppointments();
    const userAppointments = appointments.filter(a => a.userId === decoded.id);
    res.json({ appointments: userAppointments });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const createAppointment = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, date, description, status } = req.body;
    const appointments = readAppointments();

    const newAppointment = {
      id: Date.now().toString(),
      userId: decoded.id,
      title,
      date,
      description: description || "",
      status: status || "upcoming",
    };

    appointments.push(newAppointment);
    writeAppointments(appointments);
    res.json({ appointment: newAppointment });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};
