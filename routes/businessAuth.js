import express from "express";
const router = express.Router();
import { signupBusiness, loginBusiness } from "../controllers/businessAuthController.js";
import { readBusinesses } from"../utils/fileHelper.js";

// POST /api/auth/business/signup
router.post("/signup", signupBusiness);

// POST /api/auth/business/login
router.post("/login", loginBusiness);

// GET /api/auth/business/profile/:businessId
router.get("/profile", async (req, res) => {
  try {
    const { businessId } = req.query; // read businessId from query
    if (!businessId) return res.status(400).json({ message: "businessId is required" });

    const businesses = await readBusinesses("business.json");
    const business = businesses.find(b => b.id === businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    res.json(business);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
