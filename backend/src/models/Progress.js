import mongoose from "mongoose";

const subjectProgress = {
  classLevel: Number,
  completedTopics: [String],
  completedModules: [String]
};

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  subjects: {
    maths: subjectProgress,
    science: subjectProgress
  }
});

export default mongoose.model("Progress", progressSchema);
