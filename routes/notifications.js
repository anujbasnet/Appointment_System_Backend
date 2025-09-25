// routes/notifications.js
import express from "express";
import { sendToBusinesses, sendToCustomers } from "../controllers/NotificationsController.js";
import auth from "../Middleware/auth.js";

const router = express.Router();

// Send notifications
router.post("/send-to-businesses", auth, sendToBusinesses);
router.post("/send-to-customers", auth, sendToCustomers);

export default router;
