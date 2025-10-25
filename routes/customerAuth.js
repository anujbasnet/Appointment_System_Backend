import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  logout,
  changePassword,
  updateUserStatus
} from "../controllers/customerAuthController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.put("/me", updateMe);
router.post("/logout", logout);
router.post("/change-password", changePassword);
router.post("/customers/:id/status", updateUserStatus);

export default router;
