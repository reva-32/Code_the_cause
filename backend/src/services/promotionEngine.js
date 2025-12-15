import { passed } from "../utils/scoreUtils.js";

export const handlePromotion = (
  progress,
  subject,
  testType,
  module,
  topic,
  score
) => {
  const subj = progress.subjects[subject];

  if (testType === "topic" && passed(score)) {
    subj.completedTopics.push(topic);
  }

  if (testType === "module" && passed(score)) {
    subj.completedModules.push(module);
    subj.classLevel += 1;
  }
};
