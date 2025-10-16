import express from "express";
import { getBusinessById, updateBusinessById, getBusinessStaff, addBusinessStaff, updateBusinessStaff, deleteBusinessStaff } from "../controllers/business_settingsController.js";

const router = express.Router();

router.get("/:id", getBusinessById);
router.put("/:id", updateBusinessById);
// Staff
router.get('/:id/staff', getBusinessStaff);
router.post('/:id/staff', addBusinessStaff);
router.put('/:id/staff/:staffId', updateBusinessStaff);
router.delete('/:id/staff/:staffId', deleteBusinessStaff);

export default router;
