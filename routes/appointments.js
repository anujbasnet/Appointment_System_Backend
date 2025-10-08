import express from "express";
import { getAppointments, createAppointment, updateAppointmentStatus, getAvailability } from "../controllers/appointmentsController.js";

const router = express.Router();

router.get("/", getAppointments);
router.get("/availability", getAvailability);
router.post("/", createAppointment);
router.patch(":id/status", updateAppointmentStatus);

export default router;
