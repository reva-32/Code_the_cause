import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  subject: String,
  classLevel: Number,
  module: String,
  topic: String,
  type: { type: String, enum: ["audio", "video"] },
  disability: { type: String, enum: ["all", "blind", "deaf", "physical"] },
  fileUrl: String
});

export default mongoose.model("Content", contentSchema);
