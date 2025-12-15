// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Must include role
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

export default auth;
