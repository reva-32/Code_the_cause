import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  subject: String,
  classLevel: Number,
  module: String,
  topic: String,
  testType: { type: String, enum: ["entry", "topic", "module"] },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: Number
    }
  ]
});

export default mongoose.model("Test", testSchema);
