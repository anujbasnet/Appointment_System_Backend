import express from "express";
import { getBusinesses, updateBusiness, getAllBusinesses, getBusinessById } from "../controllers/businessController.js";

const router = express.Router();

// Order static routes before parametric ones
router.get("/all", getAllBusinesses); // Fetch all businesses formatted
router.get("/", getBusinesses);       // Raw list
router.get(":id", getBusinessById);   // Single business
router.put(":id", updateBusiness);    // Update business


export default router;
