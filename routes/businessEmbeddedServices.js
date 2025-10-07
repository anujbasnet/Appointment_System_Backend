import { Router } from "express";
import { listEmbeddedServices, addEmbeddedService, updateEmbeddedService, deleteEmbeddedService } from "../controllers/businessEmbeddedServicesController.js";

const router = Router({ mergeParams: true });

// /api/business/:businessId/services
router.get("/:businessId/services", listEmbeddedServices);
router.post("/:businessId/services", addEmbeddedService);
router.put("/:businessId/services/:serviceId", updateEmbeddedService);
router.delete("/:businessId/services/:serviceId", deleteEmbeddedService);

export default router;
