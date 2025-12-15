import Content from "../models/Content.js";
import Progress from "../models/Progress.js";
import Student from "../models/Student.js";
import { filterByDisability } from "../services/disabilityEngine.js";

export const getStudentContent = async (req, res) => {
  const student = await Student.findById(req.user.id);
  const progress = await Progress.findOne({ student: student._id });

  const subject = req.query.subject;
  const level = progress.subjects[subject].classLevel;

  let content = await Content.find({ subject, classLevel: level });
  content = filterByDisability(content, student.disability);

  res.json(content);
};
