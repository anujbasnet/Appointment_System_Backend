import express from "express";
import { getServices, addService, getServiceById, deleteService, updateService } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getServices);
router.post("/", addService);
router.get("/:id", getServiceById);
router.put("/:id", updateService);
router.delete("/:id", deleteService);
export default router;
