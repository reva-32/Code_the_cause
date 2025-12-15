import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import guardianRoutes from "./routes/guardian.routes.js";
import studentRoutes from "./routes/student.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/guardian", guardianRoutes);
app.use("/api/student", studentRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
