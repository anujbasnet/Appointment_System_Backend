import express from "express";
import { getAppointments, getBusinessAppointments, createAppointment, updateAppointmentStatus, getAvailability } from "../controllers/appointmentsController.js";

const router = express.Router();

router.get("/", getAppointments);
router.get("/business", getBusinessAppointments);
router.get("/availability", getAvailability);
router.post("/", createAppointment);
// Correct path for updating appointment status
router.patch("/:id/status", updateAppointmentStatus);

export default router;
