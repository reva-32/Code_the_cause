import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { getStudentContent } from "../controllers/content.controller.js";

const router = express.Router();
router.get("/student", auth, getStudentContent);
export default router;
