import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  guardian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  disability: {
    type: String,
    enum: ["none", "blind", "deaf", "physical"],
    default: "none"
  },
  credentials: {
    username: String,
    password: String
  }
});

export default mongoose.model("Student", studentSchema);
