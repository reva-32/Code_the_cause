import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { submitTest } from "../controllers/test.controller.js";

const router = express.Router();
router.post("/submit", auth, submitTest);
export default router;
