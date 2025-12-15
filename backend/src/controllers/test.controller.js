import Test from "../models/Test.js";
import Progress from "../models/Progress.js";
import { evaluate } from "../services/evaluationEngine.js";
import { handlePromotion } from "../services/promotionEngine.js";

export const submitTest = async (req, res) => {
  const { testId, answers } = req.body;
  const test = await Test.findById(testId);
  const progress = await Progress.findOne({ student: req.user.id });

  const score = evaluate(test.questions, answers);

  handlePromotion(
    progress,
    test.subject,
    test.testType,
    test.module,
    test.topic,
    score
  );

  await progress.save();
  res.json({ score });
};
