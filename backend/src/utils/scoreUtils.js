export const percentage = (correct, total) =>
  Math.round((correct / total) * 100);

export const passed = (percent, cutOff = 90) => percent >= cutOff;
