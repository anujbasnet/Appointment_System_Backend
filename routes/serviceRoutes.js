import express from "express";
import { getServices, addService } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getServices);
router.post("/", addService);

export default router;
