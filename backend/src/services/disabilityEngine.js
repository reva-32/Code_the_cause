export const filterByDisability = (content, disability) => {
  if (disability === "blind")
    return content.filter(c => c.type === "audio");
  if (disability === "deaf")
    return content.filter(c => c.type === "video");
  return content;
};
