import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Progress from "../models/Progress.js";
import { env } from "../config/env.js";

export const registerGuardian = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash, role: "guardian" });
  res.sendStatus(201);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.sendStatus(401);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET
  );
  res.json({ token, role: user.role });
};

export const studentLogin = async (req, res) => {
  const { username, password } = req.body;
  const student = await Student.findOne({
    "credentials.username": username
  });

  if (
    !student ||
    !(await bcrypt.compare(password, student.credentials.password))
  )
    return res.sendStatus(401);

  const token = jwt.sign(
    { id: student._id, role: "student" },
    env.JWT_SECRET
  );
  res.json({ token });
};
