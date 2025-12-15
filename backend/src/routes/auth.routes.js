import express from "express";
import {
  registerGuardian,
  login,
  studentLogin
} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/register", registerGuardian);
router.post("/login", login);
router.post("/student-login", studentLogin);
export default router;
