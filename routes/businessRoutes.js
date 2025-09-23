import express from "express";
import { getBusinesses, updateBusiness } from "../controllers/businessController.js";

const router = express.Router();

router.get("/", getBusinesses);       // Fetch all businesses
router.put("/:id", updateBusiness);   // Update business

export default router;
