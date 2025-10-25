import express from "express";
const router = express.Router();
import { signupBusiness, loginBusiness, changePasswordBusiness } from "../controllers/businessAuthController.js";
import * as mongoHelper from "../utils/mongoHelper.js";
import { changePassword } from "../controllers/customerAuthController.js";

// POST /api/auth/business/signup
router.post("/signup", signupBusiness);

// POST /api/auth/business/login
router.post("/login", loginBusiness);
router.post("/change-password", changePasswordBusiness);

// GET /api/auth/business/profile?businessId=xxx
router.get("/profile", async (req, res) => {
  try {
    const { businessId } = req.query; // read businessId from query
    if (!businessId) return res.status(400).json({ message: "businessId is required" });

    const businesses = await mongoHelper.readBusinesses();
    const business = businesses.find(b => b.id === businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    res.json(business);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { loginStatus } = req.body;

    if (!(loginStatus === "blocked" || loginStatus === true || loginStatus === false)) {
      return res.status(400).json({ msg: 'loginStatus must be true, false, or "blocked"' });
    }

    const updatedBusiness = await mongoHelper.updateBusiness(id, { loginStatus });
    if (!updatedBusiness) {
      return res.status(404).json({ msg: "Business not found" });
    }

    res.status(200).json({
      msg: `Business ${loginStatus === "blocked" ? "blocked" : "unblocked"} successfully`,
      business: updatedBusiness,
    });
  } catch (err) {
    console.error("Error updating business status:", err);
    res.status(500).json({ msg: "Server error while updating business status" });
  }
});

export default router;
