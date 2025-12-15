import express from "express";
import auth from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import { addStudent } from "../controllers/guardian.controller.js";

const router = express.Router();
router.post("/add-student", auth, role("guardian"), addStudent);
export default router;
