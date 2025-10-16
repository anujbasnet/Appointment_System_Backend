import express from "express";
import { getCustomers} from "../controllers/adminCustomersController.js";

const router = express.Router();

router.get("/", getCustomers);       


export default router;
