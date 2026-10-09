export const PROGRESS_KEY = "courseops-progress-v1";
export const emptyProgress = () => ({ completed: [], lastVisited: null });
export function parseProgress(value) {
  try {
    const parsed = JSON.parse(value);
    const safe = (route) =>
      typeof route === "string" &&
      /^\/lessons\/[a-z0-9-]+\/[a-z0-9-]+$/.test(route);
    return {
      completed: [
        ...new Set(
          (Array.isArray(parsed?.completed) ? parsed.completed : []).filter(
            safe,
          ),
        ),
      ],
      lastVisited: safe(parsed?.lastVisited) ? parsed.lastVisited : null,
    };
  } catch {
    return emptyProgress();
  }
}
export function filterLessons(sections, query, filter) {
  const day = query.match(/\bday\s+([1-4])\b/i)?.[1];
  const terms = query
    .replace(/\bday\s+[1-4]\b/gi, "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return sections
    .map((section) => ({
      ...section,
      lessons: section.lessons.filter((lesson) => {
        const matchesKind =
          filter === "all" ||
          (filter === "core" && lesson.track === "core") ||
          (filter === "extension" && lesson.track === "extension") ||
          lesson.kind === filter;
        const text =
          `${section.title} ${section.day} ${lesson.title} ${lesson.description}`.toLowerCase();
        return (
          (!day || section.day === `Day ${day}`) &&
          matchesKind &&
          terms.every((term) => text.includes(term))
        );
      }),
    }))
    .filter((section) => section.lessons.length);
}
