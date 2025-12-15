// controllers/student.controller.js
import Progress from "../models/Progress.js";
import Content from "../models/Content.js";

export const studentDashboard = async (req, res) => {
  const progress = await Progress.findOne({ student: req.user.id });

  const content = await Content.find({
    classLevel: progress.currentClass,
    disability: { $in: ["all", progress.disability] }
  });

  res.json({
    progress,
    content
  });
};
