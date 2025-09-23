import express from "express";
import { getBusinessById, updateBusinessById } from "../controllers/business_settingsController.js";

const router = express.Router();

router.get("/:id", getBusinessById);
router.put("/:id", updateBusinessById);

export default router;
