import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  logout,
} from "../controllers/customerAuthController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.put("/me", updateMe);
router.post("/logout", logout);

export default router;
