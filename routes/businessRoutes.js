import express from "express";
import { getBusinesses, updateBusiness, getAllBusinesses } from "../controllers/businessController.js";

const router = express.Router();

router.get("/", getBusinesses);       // Fetch businesses
router.put("/:id", updateBusiness);   // Update business
router.get("/all", getAllBusinesses); // Fetch all businesses 


export default router;
