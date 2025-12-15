// controllers/admin.controller.js
import User from "../models/User.js";
import Student from "../models/Student.js";
import Content from "../models/Content.js";
import Test from "../models/Test.js";

export const adminDashboard = async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const totalGuardians = await User.countDocuments({ role: "guardian" });
  const totalContent = await Content.countDocuments();
  const totalTests = await Test.countDocuments();

  res.json({
    totalStudents,
    totalGuardians,
    totalContent,
    totalTests
  });
};
