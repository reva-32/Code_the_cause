import express from "express";
import { adminDashboard } from "../controllers/admin.controller.js";
import allowRoles from "../middlewares/roleMiddleware.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  auth,
  allowRoles("ADMIN"),
  adminDashboard
);

export default router;
