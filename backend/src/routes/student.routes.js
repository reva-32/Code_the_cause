import express from "express";
import { studentDashboard } from "../controllers/student.controller.js";
import  allowRoles  from "../middlewares/roleMiddleware.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  auth,
  allowRoles("STUDENT"),
  studentDashboard
);

export default router;
