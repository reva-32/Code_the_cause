import { lessons as staticLessons } from "../data/lessons";

export function getAllLessons() {
  const customLessons =
    JSON.parse(localStorage.getItem("custom_lessons")) || [];

  const formattedCustomLessons = customLessons.map((l) => ({
    id: l.id,
    subject: l.subject.toLowerCase(),
    class: l.classLevel,
    title: l.title,
    videoId: null,
    videoUrl: l.videoUrl,
    audio: l.audioUrl,
  }));

  return [...staticLessons, ...formattedCustomLessons];
}