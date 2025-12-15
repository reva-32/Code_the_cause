import Student from "../models/Student.js";
import Progress from "../models/Progress.js";
import bcrypt from "bcrypt";

export const addStudent = async (req, res) => {
  const { name, disability } = req.body;

  const username = `${name}_${Date.now()}`;
  const password = Math.random().toString(36).slice(-8);

  const student = await Student.create({
    name,
    guardian: req.user.id,
    disability,
    credentials: {
      username,
      password: await bcrypt.hash(password, 10)
    }
  });

  await Progress.create({
    student: student._id,
    subjects: {
      maths: { classLevel: null, completedTopics: [], completedModules: [] },
      science: { classLevel: null, completedTopics: [], completedModules: [] }
    }
  });

  res.json({ username, password });
};
