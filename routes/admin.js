// routes/admin.js
import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import auth from "../Middleware/auth.js";
import { loginAdmin } from "../controllers/adminAuthController.js";
import { sendToBusinesses, sendToCustomers } from "../controllers/NotificationsController.js";
import { listCustomersWithStats, updateCustomer } from "../controllers/adminCustomersController.js";
const router = express.Router();

// Login route
router.post("/login", loginAdmin);

// Change credentials (protected)
router.put("/change-credentials", auth, async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // Update username and/or password
    if (newUsername) admin.username = newUsername;
    if (newPassword) admin.password = newPassword; // hashed automatically

    await admin.save();

    res.json({ message: "Credentials updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-to-businesses", auth, sendToBusinesses);
router.post("/send-to-customers", auth, sendToCustomers);

// Customers aggregated list (protected)
router.get('/customers', auth, listCustomersWithStats);
router.put('/customers/:id', auth, updateCustomer);

export default router;
